const mdTableToArr = markdownTable => {
	const lines = markdownTable.trim().split('\n')
	const headerLine = lines.shift()
	const headerColumns = headerLine
		.split('|')
		.map(h => h.trim())
		.filter(Boolean)
	const dataObjects = lines
		.map(line => {
			const columns = line
				.split('|')
				.map(c => c.trim())
				.filter(Boolean)
			const rowObject = headerColumns.reduce((obj, key, index) => {
				obj[key] = columns[index]
				return obj
			}, {})
			return Object.values(rowObject).every(value => value.includes('-')) ? null : rowObject
		})
		.filter(Boolean)
	return dataObjects
}

function arrToMdTable(data) {
	const headers = Object.keys(data[0])
	let table = '| ' + headers.join(' | ') + ' |\n'
	table += '| ' + headers.map(() => '---').join(' | ') + ' |\n'
	data.forEach(item => {
		table += '| ' + headers.map(header => item[header]).join(' | ') + ' |\n'
	})
	return table
}

export { mdTableToArr, arrToMdTable }
