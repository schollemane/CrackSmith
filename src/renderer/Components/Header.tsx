import { Alignment, Button, ButtonGroup, Intent, Navbar } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { NavLink } from "react-router-dom";
import "@blueprintjs/core/lib/css/blueprint.css";
import SettingsButton from "./SettingsButton";
import ThemeToggle from "./ThemeToggle";
import buildCard from "./ModBuilder/Templates/CardTemplate";
import buildMod from "./ModBuilder/Templates/ModTemplate";
import icon from '../../../assets/icon.png'
import './Header.css'

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
    <Navbar className="draggable">
      <Navbar.Group align={Alignment.LEFT} style={{width: '100%', display: 'grid', gridTemplateColumns: '13em 1fr', gridTemplateRows: '1fr'}}>
        <Navbar.Heading style={{display: 'flex', alignItems: 'center'}}>
          <img style={{marginRight: '1em'}} width={35} src={icon} />
          DeckSmith
          <ThemeToggle />
        </Navbar.Heading>
        <ButtonGroup minimal={true}>
          <div style={{ display: 'flex', marginLeft: 'auto'}}>
            <Button className="no-drag" icon={IconNames.MINUS} minimal={true} intent={Intent.WARNING} onClick={window.modApi.minimize} />
            <Button className="no-drag" icon={IconNames.PLUS} minimal={false} intent={Intent.PRIMARY} onClick={window.modApi.maximize} />
            <Button className="no-drag" icon={IconNames.CROSS} minimal={false} intent={Intent.DANGER} onClick={window.modApi.exit} />
          </div>
        </ButtonGroup>
      </Navbar.Group>
    </Navbar>
  )
}

export default Header;