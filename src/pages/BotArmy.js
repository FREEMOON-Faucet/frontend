import styled from "styled-components"

const BotArmyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const Title = styled.p`
  display: flex;
  justify-content: center;
  width: 70%;
  max-width: 800px;
  margin: 10px 0;
  padding-top: 20px;
  border-top: 1px solid #000;
  font-size: 1.2rem;
  text-align: center;
`

export default function BotArmy() {
  return (
    <BotArmyContainer>
      <Title>
        Coming Soon!
      </Title>
    </BotArmyContainer>
  )
}