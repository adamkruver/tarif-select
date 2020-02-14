<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Тарифная сетка</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link href="css/main.css" rel="stylesheet" type="text/css">
		<script src="js/main.js"></script>		
	</head>
	<body>
		<div class="page1">
<?php
//	Функция сообщения об ошибке
	function errorReporting($errorMessage){
		echo "<div class='errorReporting'>".$errorMessage."</div>";
	}

	function makeAggregateView($title,$speed,$min_cost,$max_cost,$link,$other_options,$tarifs_object){		
		$speed_bg_color = '#70603e';
		if(strpos($title,"ода")!=false) $speed_bg_color = '#0075d9';
		if(strpos($title,"гонь")!=false) $speed_bg_color = '#e74807';
		$tarifs_encoded = json_encode($tarifs_object);
		$tarifs_base64 = base64_encode($tarifs_encoded);
	echo "
			<div class='aggregateTarifField' tarif-title='".$title."'>
				<div class='tarifFieldInfo'>
					<div class='tarifFieldHead'>
						Тариф \"".$title."\"
					</div>
					<div class='tarifFieldBody'>
						<div class='tarifFieldBodyFlex'>
							<div class='tarifFieldBodyFlexLeft'>
								<div class='tarifFieldBodyFlexLeftSpeed' style='background-color:".$speed_bg_color."'>
									".$speed." Мбит/c
								</div>
								<div class='tarifFieldBodyFlexLeftCost'>
									".$min_cost." - ".$max_cost." ₽/мес
								</div>
								<div class='tarifFieldBodyFlexLeftOther'>";
		if($other_options){
			foreach($other_options as $option=>$value){
				echo $value."<br>";
			}
		}
		
		
	echo						"</div>
							</div>
							<div class='tarifFieldBodyFlexRight'></div>
						</div>
					</div>
				</div>
				<div class='tarifFieldFooter'>
					<a href='".$link."'>узнать подробнее на сайте www.sknt.ru</a>
					<div base64-json-object='".$tarifs_base64."'></div>
				</div>
			</div>
	
	
	
	";
		
		
	}

//	Подгружаем Json данные
	$json_page = file_get_contents('http://sknt.ru/job/frontend/data.json');

//	Проверяем, что данные загрузились
	if($json_page){
		
	//	Преводим json в объект php
		$json_data = json_decode($json_page);
		
	//	Проверяем что нет ошибок
		if(json_last_error() === JSON_ERROR_NONE){
			
		//	Проверяем что результат 'ok'
			if($json_data->{'result'} == 'ok'){
				
			//	Проверяем что есть json.tarifs
				if(isset($json_data->{'tarifs'}) == true){
					foreach($json_data->{'tarifs'} as $aggregate_tarif => $aggregate_data){
						
					//	Проверяем на соответствие данных о тарифах
						if(isset($aggregate_data->{'tarifs'})
						&& isset($aggregate_data->{'title'})
						&& isset($aggregate_data->{'speed'})
						&& isset($aggregate_data->{'link'})){
							
							$cost = array();
							foreach($aggregate_data->{'tarifs'} as $tarif_number => $tarif_data){
								array_push($cost,intval($tarif_data->{'price'})/intval($tarif_data->{'pay_period'}));
							}						
							
							makeAggregateView(
								$aggregate_data->{'title'},
								$aggregate_data->{'speed'},
								min($cost),
								max($cost),
								$aggregate_data->{'link'},
								isset($aggregate_data->{'free_options'})?$aggregate_data->{'free_options'}:false,
								$aggregate_data->{'tarifs'}
							);
							
					//	Если ошибки в тарифной сетке
						}else errorReporting("tarifs data is wrong");
					}
					
			//	Тарифов нет, рапортуем
				}else errorReporting("tarifs is not presented");
				
		//	Результат отличный от 'ok', рапортуем
			}else errorReporting("operation result is wrong");
			
	//	Есть ошибка в json данных, рапортуем
		}else errorReporting("wrong json data");
		
//	Произошла ошибка при загрузке json, рапортуем
	}else errorReporting("json page is unavaliable");

?>
		</div>
		<div class="page2">
			<div class="tarifBackButton">
			</div>
			<div class="page2Field">
			</div>
		</div>
		<div class="page3">
			<div class="tarifBackButton">
				Выбор тарифа
			</div>
			<div class="page3Field">
				<div class='tarifField'>
					<div class='tarifFieldInfo'>
						<div class='tarifFieldHead'></div>
						<div class='tarifFieldBody'>
							<div class='tarifFieldBodyFlex'>
								<div class='tarifFieldBodyFlexLeft'>
									<div class='tarifFieldBodyFlexLeftCost'></div>
									<div class='tarifFieldBodyFlexLeftCostInfo'></div>
									<div class='tarifFieldBodyFlexLeftOther'></div>
								</div>
							</div>
						</div>
					</div>
					<div class='tarifFieldFooter buttonFooter'>
						<p>
							<button class="agreeWithTarif">Выбрать</button>
						</p>
					</div>
				</div>
	
			</div>
		</div>
		<div class="tarifBlankField">
			<div class="tarifFieldInfo">
				<div class="tarifFieldHead"></div>
				<div class="tarifFieldBody">
					<div class='tarifFieldBodyFlex'>
						<div class='tarifFieldBodyFlexLeft'>
							<div class='tarifFieldBodyFlexLeftCost'></div>
							<div class='tarifFieldBodyFlexLeftOther'></div>
						</div>
						<div class='tarifFieldBodyFlexRightPage2'></div>
					</div>
				</div>
			</div>
			<div class="tarifFooter">
			</div>
		</div>			
	</body>
</html>
