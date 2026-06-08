import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'schedule',
  title: 'Schedule',
  type: 'document',
  fields: [
    defineField({ name: 'weekStartDate', title: 'Week Start Date', type: 'date', validation: (Rule) => Rule.required() }),
    defineField({ name: 'weekEndDate', title: 'Week End Date', type: 'date', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Approved', value: 'approved' },
          { title: 'Published', value: 'published' },
        ],
      },
    }),
    defineField({ name: 'generatedAt', title: 'Generated At', type: 'datetime' }),
    defineField({ name: 'approvedAt', title: 'Approved At', type: 'datetime' }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime' }),
    defineField({ name: 'shifts', title: 'Shifts', type: 'array', of: [{ type: 'shift' }] }),
  ],
})
