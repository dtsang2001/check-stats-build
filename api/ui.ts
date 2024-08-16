import { colors, createSystem } from 'frog/ui'
 
export const {
  Box,
  Columns,
  Column,
  Heading,
  HStack,
  Rows,
  Row,
  Spacer,
  Text,
  Divider,
  VStack,
  Image,
  vars,
} = createSystem({
    colors: {
      text: '#000000',
      background: '#ffffff',
      green: '#00ff00',
      red: '#ff0000',
      orange: '#ffaa00',
      gray: "rgb(149 155 157)",
      blue: 'rgb(0 199 255)'
    }
})