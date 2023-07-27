import { StyleSheet } from 'react-native';
// External dependencies.
import { Theme } from '../../../util/theme/models';

const styleSheet = (params: { theme: Theme }) => {
  const { theme } = params;
  const { colors } = theme;

  return StyleSheet.create({
    address: { flexDirection: 'row' },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary.muted,
      borderRadius: 7,
      paddingHorizontal: 7,
      marginLeft: 8,
      padding:10
    },
    icon: { marginLeft: 4 },
  });
};
export default styleSheet;
