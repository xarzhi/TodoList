<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { readTextFile, BaseDirectory, writeFile } from '@tauri-apps/api/fs'
import { mdTableToArr, arrToMdTable } from './utils/utils'
const content = ref('')
const dataSource = ref([])

onMounted(() => {
	loadData()
})
const loadData = async () => {
	let filePath = 'App/data.md'
	const promise = readTextFile(filePath, {
		dir: BaseDirectory.Resource,
	})
	promise
		.then(response => {
			const data = mdTableToArr(response).map(item => ({
				...item,
				disabled: Boolean(item.disabled),
				isCheck: item.isCheck === 'true' ? true : false,
			}))
			dataSource.value = data
		})
		.catch(error => {
			console.error(error)
		})
}
const handleAdd = () => {
	if (!content.value) {
		ElMessage({
			message: '没数据你加个der啊',
			type: 'warning',
			plain: true,
			duration: 1000,
		})
		return
	}
	dataSource.value.push({
		id: dataSource.value.length + 1,
		value: content.value,
		disabled: true,
		isCheck: false,
	})
	content.value = ''
	reWriteFile()
}
const handleDelete = index => {
	dataSource.value.splice(index, 1)
	reWriteFile()
}
const handleChange = index => {
	dataSource.value[index].disabled = false
}
const changeOk = (e, index) => {
	dataSource.value[index].value = e.target.value
	dataSource.value[index].disabled = true
	reWriteFile()
	ElMessage({
		message: '修改成功',
		type: 'success',
		plain: true,
		duration: 500,
	})
}
const handleCheck = (val, index) => {
	dataSource.value[index].isCheck = val
	reWriteFile()
	const message = val ? '完成喽' : '还得加油啊！'
	ElMessage({
		message,
		type: 'success',
		plain: true,
		duration: 1000,
	})
}

const reWriteFile = async () => {
	let filePath = 'App/data.md'
	const content = arrToMdTable(dataSource.value)
	await writeFile(filePath, content, {
		dir: BaseDirectory.Resource,
	})
	console.log(content)
	loadData()
}
</script>

<template>
	<div class="container">
		<div class="main">
			<div class="head">
				<el-input type="text" v-model.trim="content" />
				<el-button type="primary" @click="handleAdd">添加</el-button>
				<el-button type="primary" @click.enter="reWriteFile">读取</el-button>
			</div>
			<div class="body">
				<el-empty :image-size="150" v-if="!dataSource.length" />
				<ul v-else>
					<li v-for="(item, index) in dataSource" :key="item.id" class="item">
						<el-checkbox v-model="item.isCheck" @change="handleCheck($event, index)" />
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
