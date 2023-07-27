import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import {
  InteractionManager,
  ActivityIndicator,
  StyleSheet,
  View,
  TextStyle,
  FlatList,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Theme } from '@metamask/design-tokens';
import { useSelector } from 'react-redux';
import { IconName } from '../../../component-library/components/Icons/Icon';

import ButtonIcon from '../../../component-library/components/Buttons/ButtonIcon/ButtonIcon';
import { ButtonIconSizes } from '../../../component-library/components/Buttons/ButtonIcon';
import ScrollableTabView from 'react-native-scrollable-tab-view';

import DefaultTabBar from 'react-native-scrollable-tab-view/DefaultTabBar';
import { baseStyles } from '../../../styles/common';
import Tokens from '../../UI/Tokens';
import { getWalletNavbarOptions } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import { renderFromWei, weiToFiat, hexToBN } from '../../../util/number';
import Engine from '../../../core/Engine';
import CollectibleContracts from '../../UI/CollectibleContracts';
import Analytics from '../../../core/Analytics/Analytics';
import { MetaMetricsEvents } from '../../../core/Analytics';
import { getTicker } from '../../../util/transactions';
import OnboardingWizard from '../../UI/OnboardingWizard';
import ErrorBoundary from '../ErrorBoundary';
import { useTheme } from '../../../util/theme';
import { shouldShowWhatsNewModal } from '../../../util/onboarding';
import Logger from '../../../util/Logger';
import Routes from '../../../constants/navigation/Routes';
import {
  getNetworkImageSource,
  getNetworkNameFromProvider,
} from '../../../util/networks';
import generateTestId from '../../../../wdio/utils/generateTestId';
import {
  selectProviderConfig,
  selectTicker,
} from '../../../selectors/networkController';
import { selectTokens } from '../../../selectors/tokensController';
import { useNavigation } from '@react-navigation/native';
import { ProviderConfig } from '@metamask/network-controller';
import { WalletAccount } from '../../../components/UI/WalletAccount';
import { WalletAccountTemp } from '../../../components/UI/WalletAccountTemp';
import {
  selectConversionRate,
  selectCurrentCurrency,
} from '../../../selectors/currencyRateController';
import { selectAccounts } from '../../../selectors/accountTrackerController';
import { selectSelectedAddress } from '../../../selectors/preferencesController';
// import { Text } from 'react-native-svg';

const createStyles = ({ colors, typography }: Theme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: colors.background.default,
      // backgroundColor: "#90c8f5",
    },
    walletAccount: { marginTop: 28 },
    tabUnderlineStyle: {
      height: 2,
      backgroundColor: colors.primary.default,
    },
    tabStyle: {
      paddingBottom: 0,
    },
    tabBar: {
      borderColor: colors.background.default,
      marginTop: 16,
    },
    textStyle: {
      ...(typography.sBodyMD as TextStyle),
      fontWeight: '500',
    },
    loader: {
      backgroundColor: colors.background.default,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

/**
 * Main view for the wallet
 */
const Wallet = ({ navigation }: any) => {
  const { navigate } = useNavigation();
  const walletRef = useRef(null);
  const theme = useTheme();
  const styles = createStyles(theme);
  const { colors } = theme;
  /**
   * Map of accounts to information objects including balances
   */
  const accounts = useSelector(selectAccounts);
  /**
   * ETH to current currency conversion rate
   */
  const conversionRate = useSelector(selectConversionRate);
  /**
   * Currency code of the currently-active currency
   */
  const currentCurrency = useSelector(selectCurrentCurrency);
  /**
   * A string that represents the selected address
   */
  const selectedAddress = useSelector(selectSelectedAddress);
  /**
   * An array that represents the user tokens
   */
  const tokens = useSelector(selectTokens);
  /**
   * Current provider ticker
   */
  const ticker = useSelector(selectTicker);
  /**
   * Current onboarding wizard step
   */
  const wizardStep = useSelector((state: any) => state.wizard.step);
  /**
   * Current network
   */
  const networkProvider: ProviderConfig = useSelector(selectProviderConfig);

  const networkName = useMemo(
    () => getNetworkNameFromProvider(networkProvider),
    [networkProvider],
  );

  const networkImageSource = useMemo(
    () =>
      getNetworkImageSource({
        networkType: networkProvider.type,
        chainId: networkProvider.chainId,
      }),
    [networkProvider],
  );

  /**
   * Callback to trigger when pressing the navigation title.
   */
  const onTitlePress = useCallback(() => {
    navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
      screen: Routes.SHEET.NETWORK_SELECTOR,
    });
    Analytics.trackEventWithParameters(
      MetaMetricsEvents.NETWORK_SELECTOR_PRESSED,
      {
        chain_id: networkProvider.chainId,
      },
    );
  }, [navigate, networkProvider.chainId]);
  const { colors: themeColors } = useTheme();

  useEffect(() => {
    const { TokenRatesController } = Engine.context;
    TokenRatesController.poll();
  }, [tokens]);

  type ItemData = {
    name: string;
    icon: string;
  };

  /**
   * List Of Homepage
   */
  const listHome: ItemData[] = [
    {
      name: 'Swap',
      icon: IconName.SwapHorizontal,
    },
    {
      name: 'Send',
      icon: IconName.Send1,
    },
    {
      name: 'Recieve',
      icon: IconName.Received,
    },
    {
      name: 'Gas Top Up',
      icon: IconName.Gas,
    },
    {
      name: 'Transactions',
      icon: IconName.Activity,
    },
    {
      name: 'Connected',
      icon: IconName.Connect,
    },
    {
      name: 'Approvals',
      icon: IconName.SecurityTick,
    },
    {
      name: 'Address',
      icon: IconName.User,
    },
    {
      name: 'Setting',
      icon: IconName.Setting,
    },
  ];

  /**
   * Check to see if we need to show What's New modal
   */
  useEffect(() => {
    if (wizardStep > 0) {
      // Do not check since it will conflict with the onboarding wizard
      return;
    }
    const checkWhatsNewModal = async () => {
      try {
        const shouldShowWhatsNew = await shouldShowWhatsNewModal();
        if (shouldShowWhatsNew) {
          navigation.navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
            screen: Routes.MODAL.WHATS_NEW,
          });
        }
      } catch (error) {
        Logger.log(error, "Error while checking What's New modal!");
      }
    };
    checkWhatsNewModal();
  }, [wizardStep, navigation]);

  useEffect(
    () => {
      requestAnimationFrame(async () => {
        const {
          TokenDetectionController,
          NftDetectionController,
          AccountTrackerController,
        } = Engine.context as any;
        TokenDetectionController.detectTokens();
        NftDetectionController.detectNfts();
        AccountTrackerController.refresh();
      });
    },
    /* eslint-disable-next-line */
    [navigation],
  );

  useEffect(() => {
    navigation.setOptions(
      getWalletNavbarOptions(
        networkName,
        networkImageSource,
        onTitlePress,
        navigation,
        themeColors,
      ),
    );
    /* eslint-disable-next-line */
  }, [navigation, themeColors, networkName, networkImageSource, onTitlePress]);

  const renderTabBar = useCallback(
    () => (
      <DefaultTabBar
        underlineStyle={styles.tabUnderlineStyle}
        activeTextColor={colors.primary.default}
        inactiveTextColor={colors.text.default}
        backgroundColor={colors.background.default}
        tabStyle={styles.tabStyle}
        textStyle={styles.textStyle}
        style={styles.tabBar}
      />
    ),
    [styles, colors],
  );

  const onChangeTab = useCallback((obj) => {
    InteractionManager.runAfterInteractions(() => {
      if (obj.ref.props.tabLabel === strings('wallet.tokens')) {
        Analytics.trackEvent(MetaMetricsEvents.WALLET_TOKENS);
      } else {
        Analytics.trackEvent(MetaMetricsEvents.WALLET_COLLECTIBLES);
      }
    });
  }, []);

  const renderContent = useCallback(() => {
    let balance: any = 0;
    let assets = tokens;
    if (accounts[selectedAddress]) {
      balance = renderFromWei(accounts[selectedAddress].balance);

      assets = [
        {
          name: getTicker(ticker) === 'ETH' ? 'Ethereum' : ticker,
          symbol: getTicker(ticker),
          isETH: true,
          balance,
          balanceFiat: weiToFiat(
            hexToBN(accounts[selectedAddress].balance) as any,
            conversionRate,
            currentCurrency,
          ),
          logo: '../images/eth-logo-new.png',
        },
        ...(tokens || []),
      ];
    } else {
      assets = tokens;
    }

    return (
      <View style={styles.wrapper}>
        {/* <WalletAccount style={styles.walletAccount} ref={walletRef} />

        <ScrollableTabView
          renderTabBar={renderTabBar}
          // eslint-disable-next-line react/jsx-no-bind
          onChangeTab={onChangeTab}
        >
          <Tokens
            tabLabel={strings('wallet.tokens')}
            key={'tokens-tab'}
            navigation={navigation}
            tokens={assets}
          />
          <CollectibleContracts
            tabLabel={strings('wallet.collectibles')}
            key={'nfts-tab'}
            navigation={navigation}
          />
        </ScrollableTabView> */}
        <View style={{ backgroundColor: 'rgba(36, 52, 235, 0.55) ' }}>
          <WalletAccountTemp style={styles.walletAccount} ref={walletRef} />
        </View>
        <ScrollView
          style={{
            padding: 15,
            flex: 1,
          }}
        >
          <View
            style={[
              {
                backgroundColor: 'rgba(207, 215, 241, 0.3)',
                justifyContent: 'center',
                // justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 8,
              },
            ]}
          >
            <FlatList
              data={listHome}
              renderItem={renderItem}
              style={{
                alignContent: 'center',
              }}
              numColumns={3}
            />

            <View
              style={{
                borderWidth: 1,
                borderColor: 'grey',
                marginVertical: 4,
                width: '90%',
              }}
            ></View>
            <View
              style={{
                flexDirection: 'row',
                width: '90%',
                justifyContent: 'space-between',
                alignItems: 'center',
                alignContent: 'center',
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <ButtonIcon
                  iconName={IconName.Ethereum}
                  size={ButtonIconSizes.Sm}
                />
                <View>
                  <Text style={{ fontWeight: '700' }}>
                    $ 1,287.28{' '}
                    <Text style={{ fontWeight: '400', color: 'red' }}>
                      -2.75%
                    </Text>
                  </Text>
                </View>
              </View>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <ButtonIcon
                    iconName={IconName.Gas}
                    size={ButtonIconSizes.Sm}
                  />
                  <Text style={{ fontWeight: '700' }}>
                    14{' '}
                    <Text style={{ fontWeight: '400', color: 'grey' }}>
                      Gwei
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View
            style={[
              {
                backgroundColor: 'rgba(207, 215, 241, 0.3)',
                justifyContent: 'center',
                // justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 8,
                marginTop: 15,
              },
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                width: '90%',
                justifyContent: 'space-between',
                alignItems: 'center',
                alignContent: 'center',
                marginBottom: 10,
                marginTop: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <ButtonIcon
                  iconName={IconName.Bank}
                  size={ButtonIconSizes.Lg}
                />
                <View style={{ marginLeft: 3 }}>
                  <Text style={{ fontWeight: '500' }}>https://debank.com</Text>
                  <Text
                    style={{
                      fontWeight: '500',
                      color: 'rgba(106, 228, 172, 0.86)',
                    }}
                  >
                    Connected
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(36, 52, 235, 0.55)',
                  borderRadius: 5,
                }}
              >
                <ButtonIcon
                  iconName={IconName.Ethereum}
                  size={ButtonIconSizes.Lg}
                  iconColorOverride="rgba(36, 52, 235, 0.55)"
                />
                <Text style={{ fontWeight: '500' }}>Ethereum</Text>
                <ButtonIcon
                  iconName={IconName.ArrowDown}
                  size={ButtonIconSizes.Sm}
                  iconColorOverride="rgba(36, 52, 235, 0.55)"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }, [
    renderTabBar,
    accounts,
    conversionRate,
    currentCurrency,
    navigation,
    onChangeTab,
    selectedAddress,
    ticker,
    tokens,
    styles,
  ]);

  const renderItem = ({ item }: { item: ItemData }) => {
    return (
      <TouchableOpacity
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          alignContent: 'center',
          height: 100,
          width: '27%',
          marginHorizontal: '3%',
          marginVertical: 5,
          // backgroundColor: 'white',
        }}
      >
        <View style={{ borderWidth: 1, borderRadius: 3, marginBottom: 2 }}>
          <ButtonIcon
            iconName={item.icon}
            size={ButtonIconSizes.Lg}
            // onPress={onNavigateToAccountActions}
            // {...generateTestId(Platform, MAIN_WALLET_ACCOUNT_ACTIONS)}
            iconColorOverride="rgba(36, 52, 235, 0.55)"
          />
        </View>
        <Text style={{ fontWeight: '600' }}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderLoader = useCallback(
    () => (
      <View style={styles.loader}>
        <ActivityIndicator size="small" />
      </View>
    ),
    [styles],
  );

  /**
   * Return current step of onboarding wizard if not step 5 nor 0
   */
  const renderOnboardingWizard = useCallback(
    () =>
      [1, 2, 3].includes(wizardStep) && (
        <OnboardingWizard
          navigation={navigation}
          coachmarkRef={walletRef.current}
        />
      ),
    [navigation, wizardStep],
  );

  return (
    <ErrorBoundary navigation={navigation} view="Wallet">
      <View style={baseStyles.flexGrow} {...generateTestId('wallet-screen')}>
        {selectedAddress ? renderContent() : renderLoader()}

        {renderOnboardingWizard()}
      </View>
    </ErrorBoundary>
  );
};

export default Wallet;
