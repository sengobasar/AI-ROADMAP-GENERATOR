import React from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";

export default function AppNavbar({ onLoginClick, onRegisterClick, userEmail, onLogout }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand href="#" className="fw-bold fs-3">
          My Awesome App
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav" className="justify-content-end">
          {userEmail ? (
            <>
              <Navbar.Text className="me-3">
                Signed in as: <strong>{userEmail}</strong>
              </Navbar.Text>
              <Button
                variant="outline-light"
                onClick={onLogout}
                className="d-flex align-items-center transition-transform"
                style={{ transition: "transform 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline-light"
                onClick={onLoginClick}
                className="me-2 d-flex align-items-center transition-transform"
                style={{ transition: "transform 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                Login
              </Button>
              <Button
                variant="primary"
                onClick={onRegisterClick}
                className="d-flex align-items-center transition-transform"
                style={{ transition: "transform 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                Register
              </Button>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
