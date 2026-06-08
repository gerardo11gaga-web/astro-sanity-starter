import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'ptoRequest',
  title: 'PTO Request',
  type: 'document',
  fields: [
    defineField({ name: 'employee', title: 'Employee', type: 'reference', to: [{ type: 'employee' }], validation: (Rule) => Rule.required() }),
    defineField({
      name: 'requestType',
      title: 'Request Type',
      type: 'string',
      options: {
        list: [
          { title: 'Vacation', value: 'vacation' },
          { title: 'Sick Day', value: 'sick' },
          { title: 'Personal Day', value: 'personal' },
          { title: 'Availability Exception', value: 'availability-exception' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'startDate', title: 'Start Date', type: 'date', validation: (Rule) => Rule.required() }),
    defineField({ name: 'endDate', title: 'End Date', type: 'date', validation: (Rule) => Rule.required() }),
    defineField({ name: 'reason', title: 'Reason', type: 'text' }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'pending',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Denied', value: 'denied' },
          { title: 'Clarification Requested', value: 'clarification-requested' },
        ],
      },
    }),
    defineField({ name: 'submissionDate', title: 'Submission Date', type: 'datetime' }),
    defineField({ name: 'managerNotes', title: 'Manager Notes', type: 'text' }),
    defineField({ name: 'clarificationMessage', title: 'Clarification Message', type: 'text' }),
  ],
})
