(function (Vue) {//表示依赖了全局的Vue

	const STORAGE_KEY = 'items_vuejs'
	//进行本地存储获取数据
	const itemStorage = {
		//获取数据
		fetch:function(){
			//获取出来的是json字符串，通过parse函数将字符串转换成数组对象
			return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')
		},
		//保存数据
		save:function(items){
			localStorage.setItem(STORAGE_KEY,JSON.stringify(items))
		}
	}

	//注册全局指令，注册时不要加上v-，引用时才要加v-
	Vue.directive('app-focus',{
		inserted(el,binding){
			el.focus()
		}
	})
	var app = new Vue({
		el:"#todoapp",
		data:{
			items:itemStorage.fetch(),
			currentItem:null,//代表点击的那个任务项
			filterStatus:'all' //接受变化的状态值
		},
		//定义监听器
		watch: {
			//当对象中的某个属性发生改变时，默认情况下不会监听到
			// items:function(newValue,oldValue){
			// 	console.log("watch",oldValue,newValue)
			// }

			//如果希望修改对象属性时也可以被监听到，需要深度监听，使用deep:true
			items:{
				deep:true,
				handler:function(newItems,oldItems){
					//将数据保存到本地localStorage
					itemStorage.save(newItems)
				}
			}
		},
		//自定义局部指令
		directives:{
			'todo-focus':{
				update(el,binding){
					if(binding.value){
						el.focus()
					}
				}
			}
		},
		computed: {
			//根据不同状态来过滤数据,当filterStatus变化之后，来过滤出不同的数据
			filterItems(){
				switch (this.filterStatus) {
					case 'active':
						//过滤出未完成的数据
						return this.items.filter(item=>!item.completed)
						break;
					case 'completed':
						return this.items.filter(item=>item.completed)
						break;				
					default:
						return this.items
						break;
				}

			},
			toggleAll:{
				get(){	//get:function(){
					return !this.remaining
				},
				set(newStatus){	//set:function(){
					this.items.forEach(element => {
						element.completed = newStatus
					});
				}
			},
			//剩余未完成数量
			remaining(){	//remaining: function(){
				//数组filter函数过滤所有未完成的任务项
				//unItems是一个数组，当!item.completed是true时返回item到unItems中
				var unItems = this.items.filter((item)=>{
					return !item.completed
				})
				return unItems.length
			}
		},
		methods: {
			//完成编辑保存数据
			finishEdit(item,index,envent){
				const content=event.target.value.trim()
				//若里面内容为空，就删除当前项
				if (!content) {
					this.items.splice(index,1)
					return
				}
				item.content=content
				this.currentItem=null
			},
			//取消编辑
			cancelEdit(){
				//当currentItem值为空时，editing:item===currentItem等式就不会成立，所有会将editing样式移除
				this.currentItem = null
			},
			toEdit(item){
				//进入编辑状态
				//将点击的那个任务项item，赋值给currentItem，用于页面.editing样式生效
				this.currentItem = item
			},
			removeCompleted(){//剩下没有完成的
				this.items = this.items.filter(item=>!item.completed)
			},
			removeItem(index){
				this.items.splice(index,1)
			},
			addItem(event){ //ES6语法 等价于addItem:function(){
				const content = event.target.value.trim()
				if(!content){//content==0代表false  !false==true执行
					return
				}
				const id = this.items.length + 1
				this.items.push({
					id,
					content,
					completed:false
				})
				event.target.value = ''
			}
		},
	})

	//要写在Vue实例外面
	//当路由hash值发生变化的时候，会自动调用该函数
	window.onhashchange = function(){
		//#/    #/active	#/completed
		//获取路由的hash，当截取的hash值不为空的时候返回，为空返回'all'
		const hash = window.location.hash.substr(2)||'all'
		//状态一旦改变就会将hash值赋值给filterStatus
		//定义一个计算属性filterItems来感知filterStatus的变化，当它变化之后，来过滤出不同的数据
		app.filterStatus=hash
	}
	//第一次访问页面时，就调用一次，让状态值生效
	window.onhashchange()

})(Vue);
