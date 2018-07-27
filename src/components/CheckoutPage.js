import React, { Component } from 'react';
import store from '../store'
import styled from "styled-components";
import UserInfo from './forms/UserInfo'
import api from '../api/init'
// import { Route, Redirect } from 'react-router'


const Title = styled.h1`
  font-size: 2.5em;
  text-align: center;
  color: #f8d315;
  float: left;
  margin-left: 10px;
  display: block;
`;

const Table = styled.table`
  table-layout: fixed;
  width: 90%;
  border: 3px solid black;
  margin: auto;
  text-align-center;
  border-collapse: collapse;


  & > thead {
    & > tr {
      & > th {
        padding: 20px;
        border-bottom: 2px solid white;
        width: 100%;
        font-size: 1.5em;
      }
    }
  }


  & > tbody {  
    & > tr {
      & > td {
        padding: 25px;
        border-bottom: 0.1px solid white;
        border-collapse: collapse

      }
    }
  }
`;

const Button = styled.button`
  border: 0;
  background: #f8d315;
  padding: 1rem;
  color: black;
  margin: 1rem 0;
  width: auto;
  float: right;
  margin-right: 30px;
  text-transform: uppercase;
  &:hover {
    transform: scale(1.1);
  }
`;

const updateQuantity = (event) => {
  event.persist()
  // console.log(id)
  const id = event.target.id
  const quantity = parseInt(event.target.value)
  const order = store.getState().order
  order.map(item => {
    if(item.id == id) {
      item.quantity = quantity
      item.totalPrice = item.price * quantity
    }
  })
  console.log(order)
  store.dispatch({
    type: 'update_item_quantity',
    update: [...order]
  })
}

const handleDeleteItem = (event) => {
  const order = store.getState().order
  const id = event.target.id

  order.map(item => {
    if(item.id == id) {
      // console.log(item.id)
      // console.log(id)
      order.splice((item.id-1), 1)
    }
  })

  store.dispatch({
    type: 'delete_item',
    delete: [...order]
  })
}


const getOrderTotal = () => {
  let orderTotal = 0
  store.getState().order.map(order => (
    orderTotal += order.totalPrice
  ))
  return orderTotal.toFixed(2)
}

const handleClearOrder = () => {
  localStorage.removeItem("state")
  window.history.go(0)
}


class CheckoutPage extends Component {

  state = {
    inputErrors: { 
      firstName: '', 
      lastName: '',
      street: '',
      postcode: '',
      email: '',
      phoneNumber: '',
      city: '',
      userOrders: ''
    }
  }

  handleSubmit(event) {
    event.preventDefault()
    this.props.history.push('/complete');
    const config = {
      headers: {
      'Content-Type': 'application/json',
      }
    }

    const order = store.getState().order.map(orderItem =>  {
      let userOrders = `
        <p><strong>Item order</strong>: ${orderItem.id} </p>
        <p><strong>Item</strong>: ${orderItem.item} </p>
        <p><strong>Quanity</strong>: ${orderItem.quantity} </p>
      `

      if (orderItem.item) {
        userOrders += `<p><strong>Size</strong>: ${orderItem.size}</p>`
      }

      if (orderItem.heat) {
        userOrders += `<p><strong>Heat</strong>: ${orderItem.heat}</p>`
      }

      if (orderItem.filling && orderItem.filling.length > 0) {
          userOrders += `<p><strong>Fillings:</strong></p>`
          userOrders += '<ul>'
          orderItem.modifications.forEach((item) => {
              userOrders += `<li><strong>Size</strong>: ${item}</li>`
            })
            userOrders += '</ul>'
          }
          
          if (orderItem.modifications) {
            console.log(orderItem.filling)
        userOrders += `<p><strong>Modifications:</strong></p>`
        userOrders += '<ul>'
        orderItem.modifications.forEach((item) => {
          userOrders += `<li> ${item}</li>`
        })
        userOrders += '</ul>'
        userOrders += `<h4Total: $${getOrderTotal()}</h4>`
        return userOrders
      }
    })

    console.log(order)

    console.log('Posting to API ...')
    // if (event.keyCode == 13 || ) {
    api.post('/api/checkout', {
        firstName: document.querySelector('#firstName').value, 
        lastName: document.querySelector('#lastName').value, 
        street: document.querySelector('#street').value, 
        postcode: document.querySelector('#postcode').value, 
        email: document.querySelector('#email').value, 
        phoneNumber: document.querySelector('#phoneNumber').value, 
        company: document.querySelector('#company').value,
        city: document.querySelector('#city').value,
        userOrders: order
      }, config)
      .then(res => console.log(res))
      .catch(inputErrors => {
        this.setState({
          inputErrors: {
            firstName: inputErrors.response.data.firstName, 
            lastName: inputErrors.response.data.lastName, 
            street: inputErrors.response.data.street, 
            postcode: inputErrors.response.data.postcode, 
            email: inputErrors.response.data.email, 
            phoneNumber: inputErrors.response.data.phoneNumber,  
            city: inputErrors.response.data.city,  
            company: inputErrors.response.data.company, 
          }
        })
      })
  } 

  render() {
    return (
      <div className="CheckoutPage">
      <Title>YOUR ORDER</Title>
    <Button onClick={handleClearOrder}>Clear Order</Button>
    <Table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {
        store.getState().order.map(order => (
          <tr key={order.id}>
              <td>{order.item}</td>
                  <td><input type="number" style={{width: "2em"}} min="1" defaultValue={order.quantity} id={order.id} onChange={updateQuantity}/></td>  
              <td>${order.price && order.price.toFixed(2)}</td>
              <td>${order.totalPrice && order.totalPrice.toFixed(2)}</td>
              <td><button id={order.id} onClick={handleDeleteItem}>Delete</button></td>
          </tr>
          ))
        }
      <tr>
        <td colSpan="3">Order Total</td>
        <td>${getOrderTotal()}</td>
      </tr>
    </tbody>
    </Table>
  
      <UserInfo
        onClick={this.clickHandler} 
        submit={this.handleSubmit.bind(this)}
        formErrors={this.state.inputErrors}
        userOrders={this.state.getOrders} />
    </div>
    ) 
  }
}

export default CheckoutPage;