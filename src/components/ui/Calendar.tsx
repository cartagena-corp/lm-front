'use client'

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'

interface Event {
  id: string
  title: string
  start: string
  end: string
  backgroundColor?: string
  borderColor?: string
}

const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Reunión de planificación',
    start: '2024-02-20T10:00:00',
    end: '2024-02-20T11:30:00',
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  {
    id: '2',
    title: 'Revisión de diseño',
    start: '2024-02-21T15:00:00',
    end: '2024-02-21T16:00:00',
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
]

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>(initialEvents)

  const handleDateSelect = (selectInfo: any) => {
    const title = prompt('Por favor ingrese un título para el evento:')
    if (title) {
      const newEvent: Event = {
        id: String(Date.now()),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
      }
      setEvents([...events, newEvent])
    }
  }

  const handleEventClick = (clickInfo: any) => {
    if (
      confirm(
        `¿Estás seguro de que quieres eliminar el evento '${clickInfo.event.title}'?`
      )
    ) {
      const updatedEvents = events.filter(
        (event) => event.id !== clickInfo.event.id
      )
      setEvents(updatedEvents)
    }
  }

  return (
    <div className="p-8 bg-white rounded-lg">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        locale={esLocale}
        height="auto"
        contentHeight="auto"
        aspectRatio={2}
      />
    </div>
  )
} 