import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'shift',
  title: 'Shift',
  type: 'object',
  fields: [
    defineField({ name: 'employee', title: 'Employee', type: 'reference', to: [{ type: 'employee' }] }),
    defineField({ name: 'date', title: 'Date', type: 'date' }),
    defineField({ name: 'startTime', title: 'Start Time (HH:MM)', type: 'string' }),
    defineField({ name: 'endTime', title: 'End Time (HH:MM)', type: 'string' }),
    defineField({ name: 'department', title: 'Department', type: 'string' }),
    defineField({ name: 'position', title: 'Position', type: 'string' }),
    defineField({ name: 'notes', title: 'Notes', type: 'string' }),
  ],
})
