/**
 * @module paging
 */

import { PaginationProps } from 'antd';

type PagingOptions = Omit<
  PaginationProps,
  // 总分页数
  | 'total'
  // 当前页数
  | 'current'
  // 分页大小
  | 'pageSize'
  // 默认当前页数
  | 'defaultCurrent'
  // 默认分页大小
  | 'defaultPageSize'
>;

export interface Options extends Omit<PagingOptions, 'pageSizeOptions'> {
  pageSizeOptions?: number[];
}

/**
 * @function showTotal
 * @param total 总条数
 */
function showTotal(total: number): string {
  return `共 ${total} 条`;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * @function resolvePagingOptions
 * @description 获取分页配置
 * @module pageSize 分页大小
 * @param opitons 分页配置
 */
export function resolvePagingOptions(pageSize: number, opitons: Options | false = {}): PagingOptions | undefined {
  if (opitons !== false) {
    const {
      simple,
      showQuickJumper = !simple,
      showSizeChanger = !simple,
      pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS
    } = opitons;

    if (__DEV__) {
      if (showSizeChanger && !pageSizeOptions.includes(pageSize)) {
        console.error(new ReferenceError(`page size ${pageSize} not in options [${pageSizeOptions.join(', ')}]`));
      }
    }

    const pagingOptions: PagingOptions = {
      showTotal,
      size: 'medium',
      showQuickJumper,
      showSizeChanger,
      responsive: true,
      ...opitons
    };

    if (showSizeChanger) {
      pagingOptions.pageSizeOptions = pageSizeOptions;
    }

    return pagingOptions;
  }
}
