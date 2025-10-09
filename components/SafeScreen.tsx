import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from './theme'

const SafeScreen = ({children}:any) => {

    const insets = useSafeAreaInsets()
  return (
    <View style={{paddingTop:insets.top, flex:1, backgroundColor:theme.background}}>
      {children}
    </View>
  )
}

export default SafeScreen
