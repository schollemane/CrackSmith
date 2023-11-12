import { Alignment, Button, ButtonGroup, Navbar } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { NavLink } from "react-router-dom";
import "@blueprintjs/core/lib/css/blueprint.css";
import SettingsButton from "./SettingsButton";
import ThemeToggle from "./ThemeToggle";
import buildCard from "./ModBuilder/Templates/CardTemplate";
import buildMod from "./ModBuilder/Templates/ModTemplate";

const pages = [
  // {
  //   icon: IconNames.List,
  //   text: 'Cards',
  //   route: '/'
  // }
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
    <Navbar>
      <Navbar.Group align={Alignment.LEFT} style={{width: '100%', display: 'grid', gridTemplateColumns: '13em 1fr', gridTemplateRows: '1fr'}}>
        <Navbar.Heading>DeckSmith</Navbar.Heading>
        <ButtonGroup minimal={true}>
          {pages.map((page) => (
            <NavLink key={page.route} to={page.route}>
                {({ isActive }) => <Button icon={page.icon} text={page.text} active={isActive} />}
            </NavLink>
          ))}
          <ThemeToggle />
        </ButtonGroup>
      </Navbar.Group>
    </Navbar>
  )
}

export default Header;