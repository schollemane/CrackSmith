import { Alignment, Button, ButtonGroup, Navbar } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { NavLink } from "react-router-dom";
import "@blueprintjs/core/lib/css/blueprint.css";
import './Header.css'
import SettingsButton from "./SettingsButton";
import ThemeToggle from "./ThemeToggle";
import buildCard from "./ModBuilder/Templates/CardTemplate";
import buildMod from "./ModBuilder/Templates/ModTemplate";

const pages = [
  {
    icon: IconNames.CreditCard,
    text: 'Card Builder',
    route: '/'
  }
  // {
  //   icon: IconNames.HOME,
  //   text: 'Campaign Map',
  //   route: '/'
  // },
  // {
  //   icon: IconNames.DOCUMENT,
  //   text: 'Files',
  //   route: '/test'
  // },
  // {
  //   icon: IconNames.ADD,
  //   text: 'Add',
  //   route: '/add'
  // }
]

function Header() {
  return (
    <div className='nav'>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>ROUNDS Mod Builder</Navbar.Heading>
          <ButtonGroup minimal={true}>
            {pages.map((page) => (
              <NavLink key={page.route} to={page.route}>
                  {({ isActive }) => <Button icon={page.icon} text={page.text} active={isActive} />}
              </NavLink>
            ))}
            <SettingsButton />
            <ThemeToggle />
          </ButtonGroup>
        </Navbar.Group>
      </Navbar>
    </div>
  )
}

export default Header;