import React from "react"

import "bootstrap/dist/css/bootstrap.min.css"
import Table from "react-bootstrap/Table"
import "./App.scss"

export default function Stats({ calculate }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div className="d-flex w-100 justify-content-center ">
        <Table striped bordered hover size="sm" className="w-md-75 w-lg-50">
          <thead>
            <tr>
              <th colSpan={2}>refueling costs</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>day average</td>
              <td>
                <b>{calculate.averageRefuelingCosts().toFixed(2)}€</b>
              </td>
            </tr>
            <tr>
              <td>*annual based on average</td>
              <td>{calculate.currentAnnualCosts().toFixed(2)}€</td>
            </tr>
          </tbody>

          <thead>
            <tr>
              <th colSpan={2}>price per liter</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>lowest </td>
              <td>{calculate.priceLowest().toFixed(2)}€</td>
            </tr>
            <tr>
              <td>average</td>
              <td>
                <b>{calculate.averagePrice().toFixed(2)}€</b>
              </td>
            </tr>
            <tr>
              <td>highest </td>
              <td>{calculate.priceHighest().toFixed(2)}€</td>
            </tr>
            <tr>
              <td>price change lowest to highest in %</td>
              <td>{calculate.getPercentageDifference(calculate.priceLowest(), calculate.priceHighest()).toFixed(2)}%</td>
            </tr>
          </tbody>
        </Table>
      </div>
      <div className="d-flex justify-content-center">
        <p className="w-md-75 w-lg-50">
          *Sum of working days (250) minus vacation days (29).
          <br />
          Refers to Bavaria, Germany in 2022.
        </p>
      </div>
    </div>
  )
}
