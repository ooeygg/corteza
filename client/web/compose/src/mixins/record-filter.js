import { compose } from '@cortezaproject/corteza-js'
import { isBetweenOperator } from 'corteza-webapp-compose/src/lib/record-filter.js'

export default {
  methods: {
    isBetweenOperator,

    getField (name = '', module) {
      if (!module || !name) {
        return undefined
      }

      return name ? (module.fields.find(f => f.name === name) || module.systemFields().find(f => f.name === name)) : undefined
    },

    processFilter (filter = [], module) {
      return filter.map(({ groupCondition, filter = [], name }) => {
        filter = filter.map(({ record, ...f }) => {
          if (!f.name || !record) {
            return undefined
          }

          if (this.isBetweenOperator(f.operator)) {
            const field = this.getField(f.name, module)

            f.value = {
              start: field.isSystem ? record[`${f.name}-start`] : record.values[`${f.name}-start`],
              end: field.isSystem ? record[`${f.name}-end`] : record.values[`${f.name}-end`],
            }
          } else if (Object.keys(record.values).includes(f.name)) {
            f.value = record.values[f.name]
          } else if (Object.keys(record).includes(f.name)) {
            f.value = record[f.name]
          }

          return f
        }).filter(f => f)

        return { groupCondition, filter, name }
      }).filter(({ filter }) => filter.length)
    },

    createDefaultFilter (condition, field = {}) {
      return {
        condition,
        name: field.name,
        operator: field.isMulti ? 'IN' : '=',
        value: undefined,
        kind: field.kind,
        record: new compose.Record(this.module, {}),
      }
    },

    createDefaultFilterGroup (groupCondition = undefined, field) {
      return {
        groupCondition,
        filter: [
          this.createDefaultFilter('Where', field),
        ],
      }
    },
  },
}
