import React, { useEffect, useRef } from "react"
import * as d3 from "d3"

import "bootstrap/dist/css/bootstrap.min.css"
import "./Chart.css"

const Chart = ({ stored, calculate }) => {
  // const width = 960
  // const height = 480
  // const margin = { top: 20, right: 30, bottom: 65, left: 90 }
  // const innerHeight = height - margin.top - margin.bottom
  // const innerWidth = width - margin.left - margin.right

  const svgRef = useRef()

  useEffect(() => {
    // container
    const width = parseInt(d3.select("#svgContainer").style("width"))
    const height = parseInt(d3.select("#svgContainer").style("height"))
    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height).style("overflow", "visible").style("margin-top", "20px").style("background", "#f2deea").style("font-family", "Rubik")

    svg.selectAll("*").remove()
    stored.sort((a, b) => new Date(a.date) - new Date(b.date))

    // scaling
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(stored, (d) => new Date(d.date)))
      .range([0, width])
    const yScale = d3
      .scaleLinear()
      // .domain([0, d3.max(stored, (d) => d.costperday)])
      .domain([d3.min(stored, (d) => d.costperday) - 1, d3.max(stored, (d) => d.costperday) + 1])
      .range([height, 0])

    const xValue = (d) => d.date
    const yValue = (d) => d.price

    const tooltipTime = d3.timeFormat("%d.%m.%Y")

    const xAxisGroup = svg.append("g").attr("class", "x-axis").attr("transform", `translate(0, ${height})`)

    const yAxisGroup = svg.append("g").attr("class", "y-axis")

    // axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(stored.length + 1)
      .tickFormat(d3.timeFormat("%d %b"))
      .tickSizeInner([-height])
      .tickPadding(8)

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => d + "€")
      .tickSizeInner([-width])
      .tickPadding(8)

    svg.append("g").call(xAxis).attr("transform", `translate(0, ${height})`)
    svg.append("g").call(yAxis)

    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)

    // line
    const line = d3
      .line()
      .x(function (d) {
        return xScale(Date.parse(d.date))
      })
      .y(function (d) {
        return yScale(d.costperday)
      })

    const path = svg.append("path")
    path.data([stored]).attr("fill", "none").attr("d", line).attr("stroke", "#bc5090").attr("stroke-width", "2")

    const dottedLines = svg.append("g").attr("class", "lines").style("opacity", 0) //by default not visible
    const xDottedLine = dottedLines.append("line").attr("stroke", "#993a72").attr("stroke-width", 1).attr("stroke-dasharray", 4).attr("stroke-linecap", "round")

    const yDottedLine = dottedLines.append("line").attr("stroke", "#993a72").attr("stroke-width", 1).attr("stroke-dasharray", 4).attr("stroke-linecap", "round")

    // dots
    svg
      .selectAll()
      .data(stored)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(Date.parse(d.date)))
      .attr("cy", (d) => yScale(d.costperday))
      .attr("r", 5)
      .attr("fill", "#bc5090")

    const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0)

    d3.selectAll("circle")
      .on("mouseover", function (event, d) {
        d3.select(this).style("fill", "#993a72")

        tooltip.transition().duration(200).style("opacity", 0.9)
        tooltip
          .html(
            `
            <div class="info">
              ${tooltipTime(new Date(d.date))}
              <br/>
              ${d.price.toFixed(2)}€ / 1L
              <hr />
              daily cost: <b>${d.costperday}€ </b>
              <br />
              ${calculate.getPercentageAverage(yValue(d), calculate.averagePrice())}
            </div>
            `
          )
          .style("left", `${event.pageX + 16}px`)
          .style("top", `${event.pageY + 8}px`)

        xDottedLine
          .attr("x1", xScale(Date.parse(d.date)))
          .attr("x2", xScale(Date.parse(d.date)))
          .attr("y1", height)
          .attr("y2", yScale(d.costperday))

        yDottedLine
          .attr("x1", 0)
          .attr("x2", xScale(Date.parse(d.date)))
          .attr("y1", yScale(d.costperday))
          .attr("y2", yScale(d.costperday))

        dottedLines.style("opacity", 1)
      })
      .on("mouseout", function () {
        d3.select(this).style("fill", "#bc5090")

        tooltip.transition().duration(500).style("opacity", 0)

        dottedLines.style("opacity", 0)
      })
  }, [stored, calculate])

  return (
    <div id="svgContainer">
      <svg ref={svgRef} id="svgSelf"></svg>
    </div>
  )
}

export default Chart
