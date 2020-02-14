//	Объект обработки
var plugin = {
		init: _=>{
		//	Ждем полной загрузки контента
			window.addEventListener('load',_=>{
				plugin.view.init();
			});
		},
		view:{
			init: _=>{
				plugin.view.first.init();
			},
			first:{
				init: _=>{
				let page = document.querySelector('.page1');
					page.querySelectorAll('.aggregateTarifField')
						.forEach(e=>plugin.view.first.listener.enable(e));					
				},
				show: _=>{
					plugin.view.first.init();
					
				let page = document.querySelector('.page1');
					page.querySelectorAll('.aggregateTarifField').forEach(e=>{
						e.style.display='';
						setTimeout(_=>e.style.opacity = 1,100)
					});
				
				},
				hide: _=>{					
				let page = document.querySelector('.page1');
					
					page.querySelectorAll('.aggregateTarifField').forEach(e=>{
						e.style.opacity = 0;
						setTimeout(_=>e.style.display='none',200);
						plugin.view.first.listener.disable(e);
					})
				},
				listener:{
					enable: _e=>_e.addEventListener('click',plugin.view.first.listener.function),
					disable: _e=>_e.removeEventListener('click',plugin.view.first.listener.function),
					function: _e=>{
					//	Проверяем что мы кликнули не на ссылку
						if(_e.target.tagName != 'A'){
							
						let selectedTarif = _e.target.closest('.aggregateTarifField'),
							
							tarifTitle = selectedTarif.getAttribute('tarif-title'),
							tarifData = selectedTarif.querySelector('[base64-json-object]').getAttribute('base64-json-object');							
							
							plugin.view.first.hide();
							plugin.view.second.init(tarifTitle,tarifData);
							plugin.view.second.show();							
						}
					}
				}
			},
			second:{
				data: false,
				init: (_tarifTitle,_data)=>{
					try{
					let page = document.querySelector('.page2'),
						data = JSON.parse(atob(_data));

						plugin.view.second.data = {};
						
						for(let o in data)
							plugin.view.second.data[data[o].pay_period] = data[o];
						
						plugin.view.second.create();
						
						page.querySelectorAll('.tarifField')
							.forEach(e=>plugin.view.second.listener.enable(e));	
						
						plugin.view.second.back.show(_tarifTitle);
												
					}catch(e){
						console.log(e.message);
					}
				},
				show: _=>{
				let page = document.querySelector('.page2');
					setTimeout(_=>{
						page.style.display = 'block';
						page.style.opacity=1;
					},200);
				},
				hide: _=>{
					plugin.view.second.back.hide();
				let page = document.querySelector('.page2');


					page.style.opacity = 0;
					setTimeout(_=>{
						
						page.style.display = 'none';
					},200);
				},
				create: _=>{
				let blank = document.querySelector('.tarifBlankField'),
					page = document.querySelector('.page2Field');
					
				let data = plugin.view.second.data;
					
					for(let period in data){
					let view = blank.cloneNode(true);
						view.classList.remove('tarifBlankField');
						view.classList.add('tarifField');
						view.setAttribute('period',period);
						view.querySelector('.tarifFieldHead').appendChild(document.createTextNode(data[period].title));
						view.querySelector('.tarifFieldBodyFlexLeftCost').appendChild(document.createTextNode((data[period].price/period).toFixed(0)+' ₽/мес'));
					let other = view.querySelector('.tarifFieldBodyFlexLeftOther');
						other.appendChild(document.createTextNode('Разовый платеж '+data[period].price+' ₽'));
						if(period!=1){
							other.appendChild(document.createElement('br'));
							other.appendChild(document.createTextNode('скидка '+(data[1].price*period - data[period].price)+' ₽'));
						}
						page.appendChild(view);
					}
				},				
				listener:{
					enable: _e=>_e.addEventListener('click',plugin.view.second.listener.function),
					disable: _e=>_e.removeEventListener('click',plugin.view.second.listener.function),
					function: _e=>{

					let selectedTarif = _e.target.closest('.tarifField');

						plugin.view.second.hide();
						plugin.view.third.init(plugin.view.second.data[selectedTarif.getAttribute('period')]);
						plugin.view.third.show();						
					}
				},
				back:{
					show: _title=>{
						
					let page = document.querySelector('.page2'),
						backButton = page.querySelector('.tarifBackButton');
						backButton.innerHTML = "Тариф \""+_title+"\"";
						
						backButton.addEventListener('click',plugin.view.second.back.listener);
					},
					hide: _=>{
					let page = document.querySelector('.page2'),
						backButton = page.querySelector('.tarifBackButton');
					},
					listener: _=>{
					let page = document.querySelector('.page2'),
						backButton = page.querySelector('.tarifBackButton');
						
						plugin.view.second.hide();
						setTimeout(plugin.view.first.show,100);
						plugin.view.second.data = {};						
						document.querySelector('.page2Field').innerHTML ='';
						page.querySelectorAll('.tarifField')
							.forEach(e=>plugin.view.second.listener.disable(e));
						backButton.removeEventListener('click',plugin.view.second.back.listener);
					}
				}
			},
			third:{
				init: _data=>{

				let page = document.querySelector('.page3'),
					view = page.querySelector('.tarifField');
					view.querySelector('.tarifFieldHead').innerHTML = 'Тариф "'+_data.title+'"';
					view.querySelector('.tarifFieldBodyFlexLeftCost').innerHTML = "Период оплаты — "+_data.pay_period;
					switch(_data.pay_period){
						case '1': view.querySelector('.tarifFieldBodyFlexLeftCost').innerHTML += " месяц"; break
						case '3': view.querySelector('.tarifFieldBodyFlexLeftCost').innerHTML += " месяца"; break
						default: view.querySelector('.tarifFieldBodyFlexLeftCost').innerHTML += " месяцев";							
					}
					view.querySelector('.tarifFieldBodyFlexLeftCost').innerHTML += '<br>'+(_data.price/_data.pay_period).toFixed(0)+' ₽/мес';
					view.querySelector('.tarifFieldBodyFlexLeftCostInfo').innerHTML =
						'разовый платёж '+(_data.price).toFixed(0)+' ₽<br>со счета спишется '+(_data.price).toFixed(0)+' ₽';
					let payDay = +(_data.new_payday.substr(0,10)+"000"),
						serverTimeZoneHours = +(_data.new_payday.substr(11,2))/100,
						jsTimeZone = new Date().getTimezoneOffset()/-60;
					let actualDate = new Date(payDay+(jsTimeZone-serverTimeZoneHours)*1000*60*60);
					
					view.querySelector('.tarifFieldBodyFlexLeftOther').innerHTML = 
						 'Вступит в силу - сегодня<br>'
						+'активно до - '+(''+actualDate.getDate()).padStart(2, '0')+'.'+(''+(actualDate.getMonth()+1)).padStart(2, '0')+'.'+actualDate.getFullYear();
					
					
					
					/*
					
				let other = view.querySelector('.tarifFieldBodyFlexLeftOther');
					other.appendChild(document.createTextNode('Разовый платеж '+data[period].price+' ₽'));
					if(period!=1){
						other.appendChild(document.createElement('br'));
						other.appendChild(document.createTextNode('скидка '+(data[1].price*period - data[period].price)+' ₽'));
					}
*/					

					plugin.view.third.show();

					plugin.view.third.back.show();
				},
				show: _=>{
				let page = document.querySelector('.page3');
					setTimeout(_=>{
						page.style.display = 'flex';
						page.style.opacity=1;
					},200);
				},
				hide: _=>{
					plugin.view.third.back.hide();
				let page = document.querySelector('.page3');

					page.style.opacity = 0;
					setTimeout(_=>page.style.display = 'none',100);
				},
				back:{
					show: _=>{
						
					let page = document.querySelector('.page3'),
						backButton = page.querySelector('.tarifBackButton');
						
						backButton.addEventListener('click',plugin.view.third.back.listener);
					},
					hide: _=>{
					let page = document.querySelector('.page3'),
						backButton = page.querySelector('.tarifBackButton');
						backButton.removeEventListener('click',plugin.view.third.back.listener);
					},
					listener: _=>{
						plugin.view.third.hide();
						setTimeout(plugin.view.second.show,100);
					}
				}
			}
		},
	}

	plugin.init();