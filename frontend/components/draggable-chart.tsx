import React, { useState, useEffect } from 'react'
import { Bar } from "react-chartjs-2";
import 'chartjs-plugin-dragdata'

export default function DraggableChart(props) {
    const [ shouldRedraw ] = useState(false);
    const [ isLoaded, setIsLoaded ] =  useState(false);

    //  Build Data Set for the Bar Chart
    const buildDataSet = (data) => {

        let labels = data.map(c => c.label);

        let options = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '# of Pears',
                        data: data.map(c => c.aValue),
                        //datasetIndex: data.map(c => c.Id),
                        fill: true,
                        tension: 0.4,
                        borderWidth: 1,
                        borderColor: 'darkred',
                        backgroundColor: 'rgb(255, 230, 230)',
                        pointHitRadius: 25
                    },
                    {
                        label: '# of Apples',
                        data: data.map(c => c.bValue),
                        //datasetIndex: data.map(c => c.Id),
                        fill: true,
                        tension: 0.4,
                        borderWidth: 1,
                        borderColor: 'darkblue',
                        backgroundColor: 'rgb(230, 230, 255)',
                        pointHitRadius: 25
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        min: 0,
                        max: 200
                    }
                },
                onHover: function(e) {
                    const point = e.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false)
                    if (point.length) e.native.target.style.cursor = 'grab'
                    else e.native.target.style.cursor = 'default'
                },
                plugins: {
                    dragData: {
                        round: 1,
                        showTooltip: true,
                        onDragStart: function(e, element) {
                            console.log('On Drag Start ', element)
                        },
                        // Change while dragging
                        onDrag: function(e, datasetIndex, index, value) {
                            e.target.style.cursor = 'grabbing'
                            console.log('On Dragging ', datasetIndex, index, value)
                            if(datasetIndex == 0) {
                              data[index].aValue = value
                            }

                            if(datasetIndex == 1) {
                              data[index].bValue = value
                            }

                            props?.onHandleChange(data);
                        },
                        // Only change when finished dragging
                        onDragEnd: function(e, datasetIndex, index, value) {
                            console.log('On Drag End ', datasetIndex, index, value)
                            e.target.style.cursor = 'default'

                            if(datasetIndex == 0) {
                                data[index].aValue = value
                            }

                            if(datasetIndex == 1) {
                                data[index].bValue = value
                            }

                            props.onHandleChange(data);
                        },
                    }
                }
            }
        }

        return options;
    }

    let localOption = buildDataSet(props.data);

    useEffect(() => {
        setTimeout(() => {
            setIsLoaded(true)
        }, 200);
    }, [])

    return (
        <div>
            {isLoaded &&
                <Bar
                    redraw={shouldRedraw}
                    data={localOption.data}
                    options={localOption.options}
                    plugins={localOption.options.plugins}
                />
            }

        </div>
    );
}
