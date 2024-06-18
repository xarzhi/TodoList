<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs'
const content = ref('')
const dataSource = ref([])

onMounted(() => {
	read()
})

const handleAdd = () => {
	if (!content.value) {
		ElMessage({
			message: '没数据你加个der啊',
			type: 'warning',
			plain: true,
			duration: 500,
		})
		return
	}
	dataSource.push({
		id: dataSource.length + 1,
		value: content.value,
		disabled: true,
		isCheck: false,
	})
	content.value = ''
}
const handleDelete = index => {
	dataSource.splice(index, 1)
}
const handleChange = index => {
	dataSource[index].disabled = false
}
const changeOk = (e, index) => {
	dataSource[index].value = e.target.value
	dataSource[index].disabled = true
	ElMessage({
		message: '修改成功',
		type: 'success',
		plain: true,
		duration: 500,
	})
}
const handleCheck = (val, index) => {
	dataSource[index].isCheck = val
}
const readMd = markdownTable => {
	const lines = markdownTable.trim().split('\n')
	const headerLine = lines.shift() // 移除并存储表头行
	const headerColumns = headerLine
		.split('|')
		.map(h => h.trim())
		.filter(Boolean) // 分割并去除空白

	// 构建数据对象并过滤掉全为'----'的行
	const dataObjects = lines
		.map(line => {
			const columns = line
				.split('|')
				.map(c => c.trim())
				.filter(Boolean) // 分割当前行并去除空白
			const rowObject = headerColumns.reduce((obj, key, index) => {
				obj[key] = columns[index] // 根据表头分配值
				return obj
			}, {})

			// 检查是否所有值都是'----'，如果是则过滤掉
			return Object.values(rowObject).every(value => value.includes('-')) ? null : rowObject
		})
		.filter(Boolean) // 过滤掉null值

	return dataObjects
}
const read = async () => {
	let filePath = 'App/data.md'
	const promise = readTextFile(filePath, {
		dir: BaseDirectory.Resource,
	})
	promise
		.then(response => {
			const data = readMd(response).map(item => ({
				...item,
				disabled: Boolean(item.isCheck),
				isCheck: Boolean(item.isCheck),
			}))

			dataSource.value = data
		})
		.catch(error => {
			console.error(error)
		})
}
</script>

<template>
	<div class="container">
		<div class="main">
			<div class="head">
				<el-input type="text" v-model.trim="content" />
				<el-button type="primary" @click="handleAdd">添加</el-button>
				<el-button type="primary" @click="read">读取</el-button>
			</div>
			<div class="body">
				<el-empty :image-size="150" v-if="!dataSource.length" />
				<ul v-else>
					<li v-for="(item, index) in dataSource" :key="item.id" class="item">
						<el-checkbox :value="item.isCheck" @change="handleCheck($event, index)" />
						<el-input
							v-model="item.value"
							:disabled="item.disabled"
							@blur="changeOk($event, index)"
							type="textarea"
							resize="none"
							:autosize="{ minRows: 1, maxRows: 6 }"
						></el-input>
						<span class="btns">
							<el-button type="success" size="small" link @click="handleChange(index)">修改</el-button>
							<el-button type="danger" size="small" link @click="handleDelete(index)">删除</el-button>
						</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.container {
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
}
.main {
	padding: 20px;
	box-sizing: border-box;
}
.head {
	display: flex;
	justify-content: center;
	margin-bottom: 20px;
	.el-input {
		margin-right: 10px;
		width: 400px;
	}
}
.body {
	ul {
		li {
			list-style: none;
			display: flex;
			margin-bottom: 10px;
			animation: fade 0.3s;
			.el-checkbox {
				margin-right: 10px;
			}
			.el-textarea {
				width: 500px;
				margin-right: 10px;
			}
			.btns {
				display: flex;
				align-items: center;
			}
		}
		@keyframes fade {
			0% {
				transform: translate(100%);
			}
			100% {
				transform: translate(0);
			}
		}
		.item-enter,
		.item-leave-to {
			/* 离开的终点 */
			transform: translate(-100%);
		}
		.item-enter-to,
		.item-leave {
			/* 离开的起点 */
			transform: translate(0);
		}
	}
}
</style>
