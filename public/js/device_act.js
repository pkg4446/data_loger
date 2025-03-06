init();
function init() {
    const today = new Date();
    graph();
}
async function graph() {
    const sendData = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
        type:   "act",
        dvid:   window.location.pathname.split("act/")[1]
    };
    const root  = ReactDOM.createRoot(document.getElementById("root"));
    console.log(sendData);
}

function EChartsComponent() {
    const chartRef = React.useRef(null);
    React.useEffect(function() {
      const chartDom = chartRef.current;
      const myChart = echarts.init(chartDom);

      const option = {
        title: {text: '🐝'},
        tooltip: {trigger: 'axis'},
        legend: {data: ['Total', 'Bee-In', 'Bee-Out']},
        grid: {left:'3%',right:'4%',bottom:'3%',containLabel: true},
        toolbox: {feature: {saveAsImage:{}}},
        yAxis: {type:'value'},
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        series: [
          {
            name: 'Total',
            type: 'line',
            step: 'start',
            data: [120, 132, 101, 134, 90, 330, 210]
          },
          {
            name: 'Bee-In',
            type: 'line',
            step: 'middle',
            data: [220, 282, 201, 234, 290, 430, 410]
          },
          {
            name: 'Bee-Out',
            type: 'line',
            step: 'end',
            data: [450, 432, 401, 454, 590, 230, 110]
          }
        ]
      };
      
      
      myChart.setOption(option);
      
      // 클린업 함수
      return function() {
        myChart.dispose();
      };
    }, []);
    
    // JSX 대신 React.createElement 사용
    return React.createElement(
      'div',
      {
        ref: chartRef,
        style: {
            height: '300px'
        }
      }
    );
  }
  
  // 앱 컴포넌트
  function App() {
    return React.createElement(
      'div',
      {
        style: {
            margin: 'auto',
            width: 'inherit',
            height: '100%'
        }
      },
      React.createElement(EChartsComponent, null)
    );
  }
  
  // 앱 렌더링
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App, null));