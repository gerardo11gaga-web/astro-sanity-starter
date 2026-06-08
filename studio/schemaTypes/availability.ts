import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'availability',
  title: 'Availability',
  type: 'document',
  fields: [
    defineField({ name: 'employee', title: 'Employee', type: 'reference', to: [{ type: 'employee' }], validation: (Rule) => Rule.required() }),
    defineField({ name: 'dayOfWeek', title: 'Day of Week (0=Sun, 6=Sat)', type: 'number', validation: (Rule) => Rule.required().min(0).max(6) }),
    defineField({ name: 'startTime', title: 'Start Time (HH:MM)', type: 'string' }),
    defineField({ name: 'endTime', title: 'End Time (HH:MM)', type: 'string' }),
    defineField({ name: 'isRecurring', title: 'Is Recurring', type: 'boolean', initialValue: true }),
  ],
})
