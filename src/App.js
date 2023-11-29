import React, { useEffect, useState } from "react"
import * as d3 from "d3"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

import "bootstrap/dist/css/bootstrap.min.css"
import "./App.scss"

import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import Chart from "./Chart"
import Stats from "./Stats"

function App() {
  const [refueling, setRefueling] = useState({
    price: "",
    date: "",
    distance: "",
    consumption: "",
  })

  const [validated, setValidated] = useState(false)
  const [selected, setSelected] = useState()

  const [stored, setStored] = useState(() => {
    const localData = localStorage.getItem("diaries")
    // https://reactjs.org/docs/cross-origin-errors.html
    return localData ? JSON.parse(localData) : []
  })

  useEffect(() => {
    localStorage.setItem("diaries", JSON.stringify(stored), [stored])
  })

  const makeCalculations = {
    // working days in the 2022 by month
    days2022: [20, 20, 23, 19, 21, 20, 21, 22, 22, 20, 21, 21],
    // sum of working days minus vacation days (~ 29) minus non-working days (11 in Bayern && not over the weekend)
    workingDays() {
      return this.days2022.reduce((acc, cur) => acc + cur, -29)
    },
    // cost per day as average from refuels done already
    averageRefuelingCosts() {
      return stored.reduce((acc, cur) => acc + cur.costperday, 0) / stored.length
    },
    // annual fuel costs based on refuels done already
    currentAnnualCosts() {
      return this.averageRefuelingCosts() * this.workingDays()
    },
    averagePrice() {
      return stored.reduce((acc, cur) => acc + cur.price, 0) / stored.length
    },
    // lowest price per liter in dataset
    priceLowest() {
      return d3.min(stored, (d) => d.price)
    },
    // highest price per liter in dataset
    priceHighest() {
      return d3.max(stored, (d) => d.price)
    },
    // difference between lowest and highest price in percentage
    getPercentageDifference(lowest, highest) {
      const decreaseValue = lowest - highest
      return Math.abs((decreaseValue / lowest) * 100)
    },
    // annual fuel costs forecast based on last refueling
    forecastAnnualCosts() {
      if (stored.costperday) {
        return stored[stored.length - 1].costperday * this.workingDays()
      }
    },
    // compare reference value (minimum price) and calculate price change in percentage
    getPercentageAverage(numA, numB) {
      const result = Math.round(((numA - numB) / numB) * 100)
      if (numA.toFixed(2) === numB.toFixed(2)) {
        return "price as average"
      }
      return `${result}% than average`
    },
  }

  // fuel cost per day
  const costperday = Number(Math.round(refueling.price * ((refueling.consumption * refueling.distance) / 100)))

  const handleChange = (e) => {
    const name = e.target.name
    const value = e.target.value
    // update attribute name [e.target.value]: parse from string to nunber value from input
    setRefueling({ ...refueling, [name]: parseFloat(value) })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const form = e.currentTarget
    if (form.checkValidity() === false) {
      e.preventDefault()
      e.stopPropagation()
    }

    setValidated(true)

    if (refueling.price && refueling.distance && refueling.consumption && selected) {
      const newEntry = { ...refueling, id: new Date().getTime().toString(), date: selected, costperday: costperday }

      console.log(newEntry)
      console.log(stored)

      setStored([...stored, newEntry])
      setRefueling({ price: "", distance: newEntry.distance, consumption: newEntry.consumption, date: "" })
      setSelected()
    }
  }

  return (
    <div className="App">
      <div className="d-flex justify-content-center">
        <header className="w-md-75 w-lg-50">
          <h2>Commuting fuel costs.</h2>
          Did you ever wonder how much fuel do you burn commuting each day?
          <br />
          Check it easly providing fuel price, commuting distance and your car's average fuel consumption.
        </header>
      </div>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-4 d-flex w-100 justify-content-center align-content-center">
          <Col xs={6} sm={6} className="my-auto d-inline justify-content-end w-sm-33 w-lg-25 form-col-left">
            <Form.Group className="my-3" controlId="validationCustom01">
              <Form.Label>fuel price per 1 liter</Form.Label>
              <Form.Control required type="number" step="0.01" name="price" placeholder="in euro (€)" value={refueling.price} onChange={handleChange} />
              <Form.Control.Feedback>seems all right</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">not a valid amount (number)</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="validationCustom03" className="my-3">
              <Form.Label>kilometers to work a day, back and forth</Form.Label>
              <Form.Control required type="number" step="0.1" name="distance" placeholder="in kilometers" value={refueling.distance} onChange={handleChange} />
              <Form.Control.Feedback>seems all right</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">not a valid distance (number)</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="validationCustom04">
              <Form.Label>average fuel consumption per 100km</Form.Label>
              <Form.Control required type="number" step="0.1" name="consumption" placeholder="in liters" value={refueling.consumption} onChange={handleChange} />
              <Form.Control.Feedback>seems all right</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">not a valid quantity (number)</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={8} sm={6} md={4} className="my-auto form-col-right">
            <Form.Group controlId="validationCustom02" required className="full-row">
              <DayPicker mode="single" selected={selected} onSelect={setSelected} value={selected} onChange={handleChange} name="date" />
              {!selected ? (
                <div className="invalid-feedback" style={{ display: "block", marginTop: "-16px" }}>
                  pick a refueling date
                </div>
              ) : (
                <div className="valid-feedback" style={{ display: "block", marginTop: "-16px" }}>
                  seems all right
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" className="btn-custom">
          Add refueling
        </Button>
      </Form>

      {stored.length >= 1 ? <Chart stored={stored} calculate={makeCalculations} /> : null}

      <div style={{ height: "10px", marginBottom: "1.5rem" }}></div>

      {stored.length >= 1 ? <Stats calculate={makeCalculations} /> : null}
    </div>
  )
}

export default App
