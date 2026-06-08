import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'employee',
  title: 'Employee',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (Rule) => Rule.required().email() }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: { list: [{ title: 'Employee', value: 'employee' }, { title: 'Manager', value: 'manager' }] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'department', title: 'Department', type: 'string' }),
    defineField({ name: 'maxHoursPerWeek', title: 'Max Hours Per Week', type: 'number' }),
    defineField({ name: 'qualifications', title: 'Qualifications', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'alternatingScheduleGroup', title: 'Alternating Schedule Group', type: 'string' }),
  ],
})
