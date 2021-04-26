import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
export class HeadBar extends React.Component {
  render () {
    return (
      <Navbar bg='light' expand='lg'>
        <Navbar.Brand href='#home'>Giferizer</Navbar.Brand>
        <Nav.Link href='#home'>Home</Nav.Link>
        <Nav.Link href='#link'>Link</Nav.Link>
        <Nav.Link href='#link' onClick={() => this.props.onLanguageChange('EN')}>EN</Nav.Link>
        <Nav.Link href='#link' onClick={() => this.props.onLanguageChange('BR')}>BR</Nav.Link>
      </Navbar>
    )
  }
}
