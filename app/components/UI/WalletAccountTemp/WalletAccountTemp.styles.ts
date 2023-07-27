import { StyleSheet } from 'react-native';
// External dependencies.
import { Theme } from '../../../util/theme/models';
import { WalletAccountTempStyleSheetVars } from './WalletAccountTemp.types';

const styleSheet = (params: {
  theme: Theme;
  vars: WalletAccountTempStyleSheetVars;
}) => {
  const { vars, theme } = params;
  const { colors } = theme;
  const { style } = vars;
  return StyleSheet.create({
    base: {
      marginHorizontal: 16,
      // borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: 8,
      // backgroundColor:"#90c8f5",
      ...style,
    },
    account: {
      alignItems: 'center',
    },
    accountPicker: {
      borderWidth: 0,
      borderColor: colors.border.default,
      borderRadius: 8,
    },
    middleBorder: {
      borderTopWidth: 1,
      borderColor: colors.border.default,
      marginHorizontal: 16,
    },
    addressContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // backgroundColor: colors.background.default,
      padding: 20,
      borderWidth: 0,
      borderColor: colors.border.default,
      borderRadius: 8,
    },
    walletIcon:{
      backgroundColor:colors.primary.muted,
      padding:3,
      borderRadius:7
    },
    token:{
      height:25,
      paddingHorizontal:8,
      backgroundColor:colors.primary.muted,
      marginHorizontal:7,
      borderRadius:7,
      alignItems:"center",
      justifyContent:"center"
    }
  });
};
export default styleSheet;
