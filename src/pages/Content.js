import styled from "styled-components"

import Dashboard from "./Dashboard"
import Gas from "./Gas"
import Freemoon from "./Freemoon"
import Airdrops from "./Airdrops"
import BotArmy from "./BotArmy"

const ContentContainer = styled.div`
  width: 100%;
  height: 100%;
`

export default function Content({ display, connection }) {

  if(display === 0) {
    return (
      <ContentContainer>
        <Dashboard connection={connection}/>
      </ContentContainer>
    )
  } else if(display === 1) {
    return (
      <ContentContainer>
        <Gas connection={connection}/>
      </ContentContainer>
    )
  } else if(display === 2) {
    return (
      <ContentContainer>
        <Freemoon connection={connection}/>
      </ContentContainer>
    )
  } else if(display === 3) {
    return (
      <ContentContainer>
        <Airdrops connection={connection}/>
      </ContentContainer>
    )
  } else if(display === 4) {
    return (
      <ContentContainer>
        <BotArmy connection={connection}/>
      </ContentContainer>
    )
  }
}