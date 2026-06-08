import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'availabilityOverride',
  title: 'Availability Override',
  type: 'document',
  fields: [
    defineField({ name: 'employee', title: 'Employee', type: 'reference', to: [{ type: 'employee' }], validation: (Rule) => Rule.required() }),
    defineField({ name: 'date', title: 'Date', type: 'date', validation: (Rule) => Rule.required() }),
    defineField({ name: 'isAvailable', title: 'Is Available', type: 'boolean', initialValue: false }),
    defineField({ name: 'startTime', title: 'Start Time (HH:MM)', type: 'string' }),
    defineField({ name: 'endTime', title: 'End Time (HH:MM)', type: 'string' }),
    defineField({ name: 'reason', title: 'Reason', type: 'string' }),
  ],
})
