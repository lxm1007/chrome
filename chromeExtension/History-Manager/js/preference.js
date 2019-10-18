function svgBarChartEntry()
{
    get_heat_staytime_list();
}


function svgBarChart(list){
    //var list = new Array();
    //alert("aaa done");
    //list=get_heat_staytime_list();
    //alert("is it here?");
    //alert(list);
    var top_items = new Array();
    //alert("still alive?");
    //alert(list.length);//this is ok and then go die
    top_items=find_top_list(list);
    //alert("top_items.length");
    //alert(top_items.length);
    var data=new Array();
    for(var i=0;i<top_items.length;++i){
        data[i]=top_items[i].heat;
    }
    //var data=[4,12,6,15,24,18];
    var chart = d3.select("div#svg").append("svg")
    .attr("class", "chart")
    .attr("width", 440)
    .attr("height", 140)
    .append("g")
    .attr("transform", "translate(10,15)");//设置位移俩 可以在条形统计图上右键--审查元素。看看是实际效果
    
    
    
    var x = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([0, 420]);
    
    var y = d3.scale.ordinal()
    .domain(data)
    .rangeBands([0, 120]);
      
    chart.selectAll("rect")
    .data(data)
    .enter().append("rect")
    .attr("y", y)
    .attr("width", x)
    .attr("height", y.rangeBand());
    
    
    chart.selectAll("text")
    .data(data)
    .enter().append("text")
    .attr("x", x)
    .attr("y", function(d) { return y(d) + y.rangeBand() / 2; })
    .attr("dx", -3) // padding-right
    .attr("dy", ".35em") // vertical-align: middle
    .attr("text-anchor", "end") // text-align: right
    .text(String);
    
    
    chart.selectAll("line")
    .data(x.ticks(10))
    .enter().append("line")
    .attr("x1", x)
    .attr("x2", x)
    .attr("y1", 0)
    .attr("y2", 120)
    .style("stroke", "#ccc");
    
    chart.selectAll(".rule")
    .data(x.ticks(10))
    .enter().append("text")
    .attr("class", "rule")
    .attr("x", x)
    .attr("y", 0)
    .attr("dy", -3)
    .attr("text-anchor", "middle")
    .text(String);

    chart.append("line")
    .attr("y1", 0)
    .attr("y2", 120)
    .style("stroke", "#000");
}

function svgVirBarChart(){
 var data = [4, 8, 15, 16, 23, 42];
 var height = 440;
 var width = 500;
 var chart = d3.select("div#vir").append("svg")
    .attr("class", "chart")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(30,-8)");//图形水平位移量
    
 var y = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([0, 420]);//设置权重计算
    
 var x = d3.scale.ordinal()
    .domain(data)
    .rangeBands([0, 480]);
    //散列值 把480平均分配到data的每个数据段（这里是6个） 0~80，80~160,...值为（0，80，160，...）域宽80
    
 chart.selectAll("rect").data(data).enter().append("rect")
 .attr("x",x)//相当于function(d){return x(d);}
 .attr("y",function(d){return height-y(d)})//svg的坐标以左上角为原点，同过高度运算转成原点在左下角的效果
 .attr("width",x.rangeBand()) //获取散列值每段的长度 为矩形的宽
 .attr("height",y); // 通过函数1  function(d){return  (420/42)*d}  得到矩形的高
 
  //添加矩形上方的数字
 chart.selectAll("text")
    .data(data)
    .enter().append("text")
    .attr("x", function(d) { return x(d) + x.rangeBand() / 2; })  //散列值+散列宽度的一半
    .attr("y",function(d){return height-y(d)})
    .attr("dx", ".35em") //  horizontal-align: middle 居中对齐
    .attr("dy", 0) // vertical-align: middle //垂直方向无偏移
    .attr("text-anchor", "end") // text-align: right
    .text(String); //设置数据为显示值 相当于.text(function(d){ return d;})
    
 
  chart.selectAll("line") //加横线 线 有关svg的标签请查看w3chool
    .data(y.ticks(10))   //y.ticks 根据权重 把数据进行划分层次，增加可读性。可以自己改变ticks的值察看效果来理解
    .enter().append("line")
    .attr("x1", 0)
    .attr("x2", 480)
    .attr("y1", function(d){return height -y(d)})
    .attr("y2", function(d){return height -y(d)})  //画线 （x1,y1） ------> (x2,y2)
    .style("stroke", "#ccc");
 
 
 chart.selectAll(".rule")
    .data(y.ticks(10))
    .enter().append("text")
    .attr("class", "rule")
    .attr("y",function(d){return height-y(d)})
    .attr("dy",5)
    .attr("dx",-8)
    .attr("text-anchor", "middle")
    .text(String); //添加Y 轴方向的数字
    
    chart.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1",height)
    .attr("y2",height)
    .style("stroke", "#000");//添加x轴方向的线
    
    chart.append("line") //添加Y轴方向的线
    .attr("x1", 0)
    .attr("x2",0)
    .attr("y1",0)
    .attr("y2",height)
    .style("stroke", "#000");
  
}

/* I modify this file for presentation.
 * It is just a temporal version. And it can be delete or modify any time.
 */
// -----------------------------------

window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(231,233,237)'
};

window.randomScalingFactor = function() {
	return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
}

function tmp_svgBarChart(list)
{
    var top_items=find_top_list(list);

        var color = Chart.helpers.color;
        var barChartData = {
            labels: [],
            datasets: [{
                type: 'bar',
                label: 'Heat Click',
                backgroundColor: color(window.chartColors.red).alpha(0.2).rgbString(),
                borderColor: window.chartColors.red,
                data: []
            }, ]
        };
    if(top_items)
    {
        for (var i = 0;i<top_items.length;i++)
        {
            barChartData.labels.push(top_items[i].domain);
            barChartData.datasets[0].data.push(top_items[i].heat);
        }
    }
        
        // Define a plugin to provide data labels
        Chart.plugins.register({
            afterDatasetsDraw: function(chartInstance, easing) {
                // To only draw at the end of animation, check for easing === 1
                var ctx = chartInstance.chart.ctx;
                chartInstance.data.datasets.forEach(function (dataset, i) {
                    var meta = chartInstance.getDatasetMeta(i);
                    if (!meta.hidden) {
                        meta.data.forEach(function(element, index) {
                            // Draw the text in black, with the specified font
                            ctx.fillStyle = 'rgb(0, 0, 0)';
                            var fontSize = 16;
                            var fontStyle = 'normal';
                            var fontFamily = 'Helvetica Neue';
                            ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
                            if(dataset.data[index]>=1){
								 var dataString = dataset.data[index].toString();
								 //alert(typeof(dataset.data[index]))
							}
                              
						    else{
								var percent_form=((dataset.data[index])*100).toFixed(2)+'%';
								var dataString =percent_form;
								//alert(dataString)
							}
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            var padding = 5;
                            var position = element.tooltipPosition();
                            ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
                        });
                    }
                });
            }
        });

            var ctx = document.getElementById("canvas").getContext("2d");
            window.myBar = new Chart(ctx, {
                type: 'bar',
                data: barChartData,
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Heat Click URL'
                    },
                }
            });
}

function tmp_svgPieChart(list)
{

    var config = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [
                ],
                backgroundColor: [
                ],
                label: 'StayTime'
            }],
            labels: [
            ]
        },
        options: {
            responsive: true
        }
    };


    if(list && list.length > 0)
    {
        // Sort by stay time
        list.sort(function compare(obj1, obj2){
            return obj2.staytime - obj1.staytime;
        });
        var count = 0;
        var total_data = new Array();
        var sum = 0;
        for(var i = 0; i < list.length ; i++)
        {
            var r = Math.floor(Math.random() * 255);
            var b = Math.floor(Math.random() * 255);
            var g = Math.floor(Math.random() * 255);
            var random_color = "rgb(" + r + "," + g + "," + b + ")";

            if(count>5)
            {
                var rest_time = 0;
                for(var j = i; j < list.length; j++)
                {
                    if(list[j])
                    {
                        rest_time = rest_time + list[j].staytime;
                    }
                }
                total_data.push(rest_time);
                sum += rest_time;
                config.data.labels.push("Others");
                config.data.datasets[0].backgroundColor.push(random_color);
                break;
            }
            else{
                total_data.push(list[i].staytime);
                sum += list[i].staytime;
                config.data.labels.push(list[i].domain);
                config.data.datasets[0].backgroundColor.push(random_color);
            }

            count = count + 1;
        }
        for(var i = 0; i< total_data.length; i++)
        {
            config.data.datasets[0].data.push(total_data[i] / sum);
        }
    }

    config.data.datasets[0].data

    var ctx = document.getElementById("canvas2").getContext("2d");

    window.myPie = new Chart(ctx, config);
}


window.onload = function(){
  //  divBarChart();
    svgBarChartEntry();
    //alert("what");
    //svgVirBarChart();
};
