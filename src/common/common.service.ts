import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginationDto } from './dto/base-pagination.dto';
import { BaseModel } from './entity/base.entity';
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { HOST, PROTOCOL } from './const/env.const';


@Injectable()
export class CommonService {
  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    } else {
      return this.cursorPaginate(dto, repository, overrideFindOptions, path);
    }
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {

  }

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    /**
     * where__likeCount__more_than
     *
     * where__title__iLike
     */
    const findOptions = this.composeFindOptions<T>(dto);
    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });
    const lastItem = results.length > 0 && results.length == dto.take ? results[results.length - 1] : null;

    const nextUrl = lastItem &&  new URL(`${PROTOCOL}://${HOST}/${path}`);

    if(nextUrl){{
      /**
       * dto의 키값들을 루핑하면서
       * 키값에 해당되는 밸류가 존재하면
       * param에 그대로 붙여넣는다.
       *
       * 단, where__id__more_than 값만 lastItemm의 마지막 값으로 넣어준다
       */
      for(const key of Object.keys(dto)){
        if(dto[key]){
          if(key !== 'where__id__more_than' && key !== 'where__id__less_than'){
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }
      let key = null;

      if(dto.order_createdAt === 'ASC'){
        key = 'where__id__more_than';
      }
      else{
        key = 'where__id__less_than';
      }
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }}

    return {
      data: results,
      count: results.length,
      cursor: {
        after: lastItem?.id ?? null,
      },
      next: nextUrl?.toString() ?? null,
    }
  }

  private composeFindOptions<T extends BaseModel>(dto: BasePaginationDto): FindManyOptions<T> {
    /**
     * where,
     * order,
     * take,
     * skip -> page 기반일때만
     */
    /**
     * DTO의 현재 생긴 구조는 다음과 같다.
     *
     * {
     *   where__id__more_than: 1,
     *   order__createdAt: 'DESC',
     * }
     *
     * 현재는 where__id__more_than / where__id__less_than에 해당되는 where 필터만 사용중이지만
     * where__likeCount__more_than / where__title__iLike 등 다양한 필터를 사용할 수 있도록 구조를 변경해야 한다.
     * 모든 where 필터들을 자동으로 파싱할 수 있게 기능을 제작해야한다.
     *
     * 1) where로 시작한다면 필터 로직을 적용한다.
     * 2) order로 시작한다면 정렬 로직을 적용한다.
     * 3) 필터 로직을 적용한다면 '__'로 split했을 때 3개의 값으로 나뉘는지
     *    2개의 값으로 나뉘는 지 확인한다.
     *    3-1) 3개의 값으로 나뉜다면 FILTER_MAPPER에서 해당되는 operator 함수를 찾아서 적용한다.
     *    예) ['where, 'id', 'more_than']
     *    3-2) 2개의 값으로 나뉜다면 정확한 값을 필터하는 것이기 때문에 operator 없이 작용한다.
     *    예) ['where', 'id']
     * 4) order의 경우 3-2)와 같은 방식으로 작용한다.
     */

    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      // key -> where__id__less_than
      // value -> 1
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseWhereFilter(key, value),
        };
      }
    }
    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? (dto.page - 1) * dto.take : null,
    };
  }

  private parseWhereFilter<T extends BaseModel>(key: string, value: any): FindOptionsWhere<T> | FindOptionsOrder<T>{
    const options: FindOptionsWhere<T> = {};
    /**
     * 예를 들어 where__id__more_than: 1 이라는 값이 들어온다면
     * ['where', 'id', 'more_than'] 이런식으로 나눌 수 있다.
     *
     */
    const split = key.split('__');
    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(`where 필터는 '__'로 split 했을 때 길이가 2 또는 3이어야합니다. - 문제되는 키값은 ${key}입니다.`);
    }
    /**
     * 길이가 2인 경우
     * where_id = 3
     *
     * FindOptionsWhere로 풀어보면
     * 아래와 같다
     *
     * {
     *   where: {
     *     id: 3,
     *   }
     * }
     */
    if (split.length === 2) {
      // ['where', 'id']
      const [_, field] = split;
      /**
       * field -> 'id'
       * value -> 3
       */
      options[field] = value;
    } else {
      /**
       * 길이가 3일 경우에는 TypeORM에서 제공하는 operator를 사용해야한다.
       *
       * where__id__more_than의 경우
       * where는 버려도 되고 두 번째 값은 필터할 키값이 되고
       * 세 번째 값은 typeorm 유틸리티가 된다.
       *
       * FILTER_MAPPER에서 미리 정의해둔 값들로
       * field 값에 FILTER_MAPPER에서 해당되는 utility를 가져온 후
       * 값에 적용해준다.
       */
        // ['where', 'id', 'more_than']
      const [_, field, operator] = split;
      // where__id__between = 3,4
      // 만약에 split 대상 문자가 존재하지 않으면 길이가 무조건 1이다.
      const values = value.toString().split(',');
      // field -> 'id'
      // operator -> 'more_than'
      // FILTER_MAPPER[operator] -> MoreThan
      if (operator === 'between') {
        options[field] = FILTER_MAPPER[operator](values[0], values[1]);
      } else {
        options[field] = FILTER_MAPPER[operator](value);
      }
    }
    return options;
  }

  
}