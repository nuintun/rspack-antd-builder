/**
 * @module useListy
 */

import usePagingRequest, {
  Dispatch,
  hasQuery,
  Options as InitOptions,
  Pagination as RequestPagination,
  Refs as RequestRefs,
  RequestOptions as RequestInit,
  Transform
} from './usePagingRequest';
import { useMemo } from 'react';
import useSearchFilters from './useSearchFilters';
import useStableCallback from './useStableCallback';
import { Query as Filter } from '/js/utils/request';
import { normalize, SortOrder } from '/js/utils/sorter';
import { GetProp, ListyProps, PaginationProps } from 'antd';
import { Options as PagingOptions, resolvePagingOptions } from '/js/utils/paging';

export interface Fetch {
  (options?: RequestOptions): void;
}

export interface RequestOptions extends RequestInit {
  filter?: Filter | false;
  sorter?: SortOrder[] | false;
}

export type OnChange = GetProp<PaginationProps, 'onChange'>;

export interface Options<I, E, T> extends InitOptions<I, E, T> {
  pagination?: Pagination | false;
}

export interface Refs<I, E> extends RequestRefs<I, E> {
  readonly filters: Filters;
}

type Filters = [filter: Filter | false, sorter: SortOrder[] | false];

export type Pagination = Omit<PagingOptions & Partial<RequestPagination>, 'current'>;

export interface DefaultListyProps<I> extends Required<Pick<ListyProps<I>, 'items'>> {
  loading: boolean;
  pagination: PaginationProps | false;
}

/**
 * @function useListy
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useListy<I, E = unknown>(
  url: string | URL,
  options?: Options<I, E, I>,
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultListyProps<I>, fetch: Fetch, dispatch: Dispatch<I[]>, refs: Refs<I, E>];
/**
 * @function useListy
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useListy<I, E = unknown, T = I>(
  url: string | URL,
  options: Options<I, E, T> & { transform: Transform<I, T> },
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultListyProps<T>, fetch: Fetch, dispatch: Dispatch<T[]>, refs: Refs<I, E>];
/**
 * @function useListy
 * @description [hook] 列表操作
 * @param url 请求地址
 * @param options 请求配置
 * @param initialLoadingState 初始加载状态
 */
export default function useListy<I, E = unknown, T = I>(
  url: string | URL,
  options: Options<I, E, T> = {},
  initialLoadingState?: boolean | (() => boolean)
): [props: DefaultListyProps<I | T>, fetch: Fetch, dispatch: Dispatch<I[] | T[]>, refs: Refs<I, E>] {
  const [getFilters, updateFilters] = useSearchFilters<Filters>([false, false]);

  const [loading, dataSource, request, dispatch, originRefs] = usePagingRequest(
    url,
    options as Options<I, E, I>,
    initialLoadingState
  );

  const fetch = useStableCallback<Fetch>((fetchInit = {}) => {
    updateFilters([fetchInit.filter, fetchInit.sorter]);

    const [filter, sorter] = getFilters();

    request({
      ...options,
      ...fetchInit,
      query: {
        ...options.query,
        ...fetchInit.query,
        ...filter,
        ...normalize(sorter)
      }
    });
  });

  const onChange = useStableCallback<OnChange>((page, pageSize) => {
    const { pagination } = options;

    if (pagination) {
      pagination.onChange?.(page, pageSize);
    }

    fetch({ pagination: { page, pageSize } });
  });

  const pagination = useMemo((): PaginationProps | false => {
    const refsPagination = originRefs.pagination;

    if (hasQuery(refsPagination)) {
      const { total = 0 } = originRefs.response;
      const { page, pageSize } = refsPagination;

      return {
        ...resolvePagingOptions(pageSize, options.pagination),
        current: page,
        align: 'end',
        pageSize,
        onChange,
        total
      };
    }

    return refsPagination;
  }, [originRefs.pagination, originRefs.response.total, options.pagination]);

  const refs = useMemo<Refs<I, E>>(() => {
    return {
      get filters() {
        return getFilters();
      },
      get response() {
        return originRefs.response;
      },
      get pagination() {
        return originRefs.pagination;
      }
    };
  }, []);

  const props: DefaultListyProps<I | T> = {
    loading,
    pagination,
    items: dataSource
  };

  return [props, fetch, dispatch as Dispatch<I[] | T[]>, refs];
}
