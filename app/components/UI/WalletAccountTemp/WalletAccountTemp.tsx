// Third parties dependencies
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Platform, View, Text as Text1 } from 'react-native';
// External dependencies

import Text, {
  TextColor,
  TextVariant,
} from '../../../component-library/components/Texts/Text';
import { IconName } from '../../../component-library/components/Icons/Icon';
import PickerAccount from '../../../component-library/components/Pickers/PickerAccount';
import { AvatarAccountType } from '../../../component-library/components/Avatars/Avatar/variants/AvatarAccount';
import { createAccountSelectorNavDetails } from '../../../components/Views/AccountSelector';
import { useStyles } from '../../../component-library/hooks';
import generateTestId from '../../../../wdio/utils/generateTestId';
import AddressCopy from '../AddressCopy';
import {
  doENSReverseLookup,
  isDefaultAccountName,
} from '../../../util/ENSUtils';
import { selectChainId } from '../../../selectors/networkController';
import {
  selectIdentities,
  selectSelectedAddress,
} from '../../../selectors/preferencesController';
import ButtonIcon from '../../../component-library/components/Buttons/ButtonIcon/ButtonIcon';
import { ButtonIconSizes } from '../../../component-library/components/Buttons/ButtonIcon';
import Routes from '../../../constants/navigation/Routes';

// Internal dependencies
import styleSheet from './WalletAccountTemp.styles';
import { WalletAccountTempProps } from './WalletAccountTemp.types';
import {
  WALLET_ACCOUNT_ICON,
  MAIN_WALLET_ACCOUNT_ACTIONS,
} from '../../../../wdio/screen-objects/testIDs/Screens/WalletView.testIds';

const WalletAccountTemp = (
  { style }: WalletAccountTempProps,
  ref: React.Ref<any>,
) => {
  const { styles } = useStyles(styleSheet, { style });

  const { navigate } = useNavigation();
  const [ens, setEns] = useState<string>();

  const yourAccountRef = useRef(null);
  const accountActionsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    yourAccountRef,
    accountActionsRef,
  }));
  /**
   * A string that represents the selected address
   */
  const selectedAddress = useSelector(selectSelectedAddress);

  /**
   * An object containing each identity in the format address => account
   */
  const identities = useSelector(selectIdentities);

  const chainId = useSelector(selectChainId);

  const accountAvatarType = useSelector((state: any) =>
    state.settings.useBlockieIcon
      ? AvatarAccountType.Blockies
      : AvatarAccountType.JazzIcon,
  );
  const account = {
    address: selectedAddress,
    ...identities[selectedAddress],
  };

  const lookupEns = useCallback(async () => {
    try {
      const accountEns = await doENSReverseLookup(account.address, chainId);

      setEns(accountEns);
      // eslint-disable-next-line no-empty
    } catch {}
  }, [account.address, chainId]);

  useEffect(() => {
    lookupEns();
  }, [lookupEns]);

  const onNavigateToAccountActions = () => {
    navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
      screen: Routes.SHEET.ACCOUNT_ACTIONS,
    });
  };

  return (
    <View style={styles.base}>
      {/* <PickerAccount
        ref={yourAccountRef}
        accountAddress={account.address}
        accountName={
          isDefaultAccountName(account.name) && ens ? ens : account.name
        }
        accountAvatarType={accountAvatarType}
        onPress={() => {
          navigate(...createAccountSelectorNavDetails({}));
        }}
        showAddress={false}
        cellAccountContainerStyle={styles.account}
        style={styles.accountPicker}
        {...generateTestId(Platform, WALLET_ACCOUNT_ICON)}
      />
      <View style={styles.middleBorder} />
      <Text>HEllO</Text>
      <View style={styles.addressContainer} ref={accountActionsRef}>
        <AddressCopy formatAddressType="short" />
        <ButtonIcon
          iconName={IconName.MoreHorizontal}
          size={ButtonIconSizes.Sm}
          onPress={onNavigateToAccountActions}
          {...generateTestId(Platform, MAIN_WALLET_ACCOUNT_ACTIONS)}
        />
      </View> */}
      <View style={styles.addressContainer} ref={accountActionsRef}>
        <View style={{ flexDirection: 'row' }}>
          <AddressCopy formatAddressType="short" />
        </View>
        <View style={styles.walletIcon}>
          <ButtonIcon
            iconName={IconName.Wallet}
            size={ButtonIconSizes.Lg}
            onPress={onNavigateToAccountActions}
            {...generateTestId(Platform, MAIN_WALLET_ACCOUNT_ACTIONS)}
          />
        </View>
      </View>
      <View
        style={[
          // styles.addressContainer,
          { paddingHorizontal: 29 },
        ]}
      >
        <Text1
          style={{
            marginRight: 5,
            fontWeight: 'bold',
            fontSize: 25,
            color: 'white',
          }}
          // variant={TextVariant.BodySMBold}
        >
          $ 174,669,119
        </Text1>
      </View>
      <View style={styles.addressContainer} ref={accountActionsRef}>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.token}>
            <Text color={TextColor.Primary}>Token</Text>
          </View>
          <View style={styles.token}>
            <Text color={TextColor.Primary}>Defi</Text>
          </View>
          <View style={styles.token}>
            <Text color={TextColor.Primary}>NFT</Text>
          </View>
        </View>
        <View
          style={[
            styles.walletIcon,
            {
              flexDirection: 'row',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'white',
              paddingHorizontal: 5,
            },
          ]}
        >
          <ButtonIcon
            iconName={IconName.Bank}
            size={ButtonIconSizes.Lg}
            // onPress={onNavigateToAccountActions}
            // {...generateTestId(Platform, MAIN_WALLET_ACCOUNT_ACTIONS)}
          />
          <Text>|</Text>
          <ButtonIcon
            iconName={IconName.Explore}
            size={ButtonIconSizes.Lg}
            // onPress={onNavigateToAccountActions}
            // {...generateTestId(Platform, MAIN_WALLET_ACCOUNT_ACTIONS)}
          />
        </View>
      </View>
    </View>
  );
};
export default forwardRef(WalletAccountTemp);
