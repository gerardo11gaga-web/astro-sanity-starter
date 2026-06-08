import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'notification',
  title: 'Notification',
  type: 'document',
  fields: [
    defineField({ name: 'recipient', title: 'Recipient', type: 'reference', to: [{ type: 'employee' }], validation: (Rule) => Rule.required() }),
    defineField({ name: 'type', title: 'Type', type: 'string' }),
    defineField({ name: 'message', title: 'Message', type: 'text' }),
    defineField({ name: 'isRead', title: 'Is Read', type: 'boolean', initialValue: false }),
    defineField({
      name: 'relatedDocument',
      title: 'Related Document',
      type: 'object',
      fields: [
        defineField({ name: '_type', title: 'Type', type: 'string' }),
        defineField({ name: '_id', title: 'ID', type: 'string' }),
      ],
    }),
    defineField({ name: 'createdAt', title: 'Created At', type: 'datetime' }),
  ],
})
