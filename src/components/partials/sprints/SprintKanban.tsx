'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSprintStore } from '@/lib/store/SprintStore'
import { useIssueStore } from '@/lib/store/IssueStore'
import { useConfigStore } from '@/lib/store/ConfigStore'
import { useAuthStore } from '@/lib/store/AuthStore'
import { AlertCircleIcon } from '@/assets/Icon'
import { TaskProps, SprintProps } from '@/lib/types/types'
import { sortSprints } from '@/lib/utils/sprint.utils'

interface DraggableIssueProps {
  issue: TaskProps
  isOverlay?: boolean
}

function DraggableIssue({ issue, isOverlay = false }: DraggableIssueProps) {
  const { projectConfig } = useConfigStore()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id || 'issue' })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getPriorityInfo = (priorityId: number) => {
    const priority = projectConfig?.issuePriorities?.find(p => p.id === priorityId)
    return priority || { name: 'Sin prioridad', color: '#6b7280' }
  }

  const getTypeInfo = (typeId: number) => {
    const type = projectConfig?.issueTypes?.find(t => t.id === typeId)
    return type || { name: 'Sin tipo', color: '#6b7280' }
  }

  const priorityInfo = getPriorityInfo(issue.priority)
  const typeInfo = getTypeInfo(issue.type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-50' : ''
      } ${isOverlay ? 'rotate-2 scale-105' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1">
            {issue.title}
          </h4>
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium ml-2 shrink-0"
            style={{
              backgroundColor: `${priorityInfo.color}15`,
              color: priorityInfo.color,
              borderColor: `${priorityInfo.color}30`,
              border: '1px solid'
            }}
          >
            {priorityInfo.name}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span 
            className="px-2 py-1 rounded-full"
            style={{
              backgroundColor: `${typeInfo.color}15`,
              color: typeInfo.color
            }}
          >
            {typeInfo.name}
          </span>
          <span>{issue.estimatedTime}h</span>
        </div>
        
        <p className="text-xs text-gray-400">#{issue.id}</p>
      </div>
    </div>
  )
}

interface KanbanColumnProps {
  statusId: number
  statusName: string
  statusColor: string
  issues: TaskProps[]
  sprintId: string
}

function KanbanColumn({ statusId, statusName, statusColor, issues, sprintId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${sprintId}-status-${statusId}`,
  })

  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 min-w-72 rounded-lg border-2 border-dashed p-4 transition-all duration-200 ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
      }`}
      style={!isOver ? {
        backgroundColor: `${statusColor}08`,
        borderColor: `${statusColor}40`
      } : {}}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          <h3 className="font-medium text-gray-900 text-sm">{statusName}</h3>
        </div>
        <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
          {issues.length}
        </span>
      </div>

      <SortableContext items={issues.map(issue => issue.id || 'issue')} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {issues.map(issue => (
            <DraggableIssue key={issue.id} issue={issue} />
          ))}
          {issues.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <AlertCircleIcon size={20} />
              <p className="text-xs mt-2">Sin issues</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

interface SprintKanbanRowProps {
  sprint: SprintProps
  issues: TaskProps[]
}

function SprintKanbanRow({ sprint, issues }: SprintKanbanRowProps) {
  const { projectConfig } = useConfigStore()
  const issueStatuses = projectConfig?.issueStatuses || []

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{sprint.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{sprint.goal}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-400">
              {issues.length} issues
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {issueStatuses.map(status => {
            const statusIssues = issues.filter(issue => issue.status === status.id)
            return (
              <KanbanColumn
                key={status.id}
                statusId={status.id}
                statusName={status.name}
                statusColor={status.color}
                issues={statusIssues}
                sprintId={sprint.id || ''}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function SprintKanban() {
  const { sprints, isLoading: sprintsLoading } = useSprintStore()
  const { issues, isLoading: issuesLoading, updateIssue } = useIssueStore()
  const { projectConfig, isLoading: configLoading } = useConfigStore()
  const { getValidAccessToken } = useAuthStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedIssue, setDraggedIssue] = useState<TaskProps | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    
    if (issues.content && Array.isArray(issues.content)) {
      const issue = issues.content.find((i: any) => i.id === active.id && 'title' in i) as TaskProps
      if (issue) {
        setDraggedIssue(issue)
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) {
      setActiveId(null)
      setDraggedIssue(null)
      return
    }

    if (issues.content && Array.isArray(issues.content)) {
      const activeIssue = issues.content.find((i: any) => i.id === active.id && 'title' in i) as TaskProps
      if (!activeIssue) {
        setActiveId(null)
        setDraggedIssue(null)
        return
      }

      // Extract status ID from over.id (format: "sprintId-status-statusId")
      const overIdParts = over.id.toString().split('-status-')
      if (overIdParts.length === 2) {
        const targetStatusId = parseInt(overIdParts[1])
        
        if (targetStatusId && activeIssue.status !== targetStatusId) {
          const token = await getValidAccessToken()
          if (token) {
            try {
              await updateIssue(token, {
                id: activeIssue.id!,
                title: activeIssue.title,
                descriptions: activeIssue.descriptions,
                estimatedTime: activeIssue.estimatedTime,
                priority: activeIssue.priority,
                type: activeIssue.type,
                status: targetStatusId
              })
            } catch (error) {
              console.error('Error updating issue status:', error)
            }
          }
        }
      }
    }

    setActiveId(null)
    setDraggedIssue(null)
  }

  if (sprintsLoading || issuesLoading || configLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const sprintsData = sprints || []
  const issuesData = issues.content || []

  if (!sprintsData.length) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
        <AlertCircleIcon size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">No hay sprints disponibles</h3>
        <p className="text-gray-500">Crea tu primer sprint para comenzar a organizar las issues.</p>
      </div>
    )
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {sortSprints(sprintsData).map((sprint: SprintProps) => {
          const sprintIssues = issuesData.filter((issue: any) => 
            'sprintId' in issue && issue.sprintId === sprint.id
          ) as TaskProps[]
          
          return (
            <SprintKanbanRow
              key={sprint.id}
              sprint={sprint}
              issues={sprintIssues}
            />
          )
        })}
      </div>

      <DragOverlay>
        {draggedIssue && (
          <DraggableIssue issue={draggedIssue} isOverlay />
        )}
      </DragOverlay>
    </DndContext>
  )
}