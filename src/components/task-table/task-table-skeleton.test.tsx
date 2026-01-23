import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Table } from '~/components/ui/table'
import { TaskTableSkeleton } from './task-table-skeleton'

const renderSkeleton = (rows?: number) => {
  return render(
    <Table>
      <TaskTableSkeleton rows={rows} />
    </Table>,
  )
}

describe('TaskTableSkeleton', () => {
  it('should render default number of skeleton rows', () => {
    renderSkeleton()

    const skeletons = screen.getAllByRole('row')
    expect(skeletons).toHaveLength(10)
  })

  it('should render specified number of skeleton rows', () => {
    renderSkeleton(5)

    const skeletons = screen.getAllByRole('row')
    expect(skeletons).toHaveLength(5)
  })

  it('should render skeleton cells for each row', () => {
    renderSkeleton(3)

    const rows = screen.getAllByRole('row')
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td')
      expect(cells).toHaveLength(5)
    })
  })
})
