// Web3Auth Libraries
import { Web3AuthConnector } from '@web3auth/web3auth-wagmi-connector';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { Web3Auth } from '@web3auth/modal';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { OpenloginAdapter, OPENLOGIN_NETWORK } from '@web3auth/openlogin-adapter';
import { CHAIN_NAMESPACES, type OPENLOGIN_NETWORK_TYPE } from '@web3auth/base';
import { TorusWalletConnectorPlugin } from '@web3auth/torus-wallet-connector-plugin';
import type { Chain } from '@wagmi/chains';

const iconUrl = 'https://web3auth.io/docs/contents/logo-ethereum.png';

export default function Web3AuthConnectorInstance(
	chains: Chain[],
	clientId: string,
	noModal: boolean = false
) {
	// Create Web3Auth Instance

	console.log(chains);

	const chainConfig = {
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		chainId: '0x' + chains[0].id.toString(16),
		rpcTarget: chains[0].rpcUrls.default.http[0], // This is the public RPC we have added, please pass on your own endpoint while creating an app
		displayName: chains[0].name,
		tickerName: chains[0].nativeCurrency?.name,
		ticker: chains[0].nativeCurrency?.symbol,
		blockExplorer: chains[0].blockExplorers?.default.url[0] as string,
		network: chains[0].network
	};

	switch (chainConfig.network) {
		case 'homestead':
			chainConfig.network = OPENLOGIN_NETWORK.MAINNET;
			break;
		case 'goerli':
			chainConfig.network = OPENLOGIN_NETWORK.TESTNET;
			break;
		default:
			chainConfig.network = OPENLOGIN_NETWORK.MAINNET;
			break;
	}

	const web3AuthInstance = !noModal
		? new Web3Auth({
				clientId: clientId,
				chainConfig,
				web3AuthNetwork: chainConfig.network as OPENLOGIN_NETWORK_TYPE
		  })
		: new Web3AuthNoModal({
				clientId: clientId,
				chainConfig,
				web3AuthNetwork: chainConfig.network as OPENLOGIN_NETWORK_TYPE
		  });

	const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

	// Add openlogin adapter for customisations
	const openloginAdapterInstance = new OpenloginAdapter({
		privateKeyProvider,
		adapterSettings: {
			uxMode: 'redirect',
			whiteLabel: {
				appName: 'Wagmi Web3Auth Demo'
			}
		}
	});
	web3AuthInstance.configureAdapter(openloginAdapterInstance);

	// Add Torus Wallet Plugin (optional)
	const torusPlugin = new TorusWalletConnectorPlugin({
		torusWalletOpts: {
			buttonPosition: 'bottom-left'
		},
		walletInitOptions: {
			whiteLabel: {
				theme: { isDark: false, colors: { primary: '#00a8ff' } },
				logoDark: iconUrl,
				logoLight: iconUrl
			},
			useWalletConnect: true,
			enableLogging: true
		}
	});
	web3AuthInstance.addPlugin(torusPlugin);

	return new Web3AuthConnector({
		chains: chains,
		options: {
			web3AuthInstance,
			loginParams: {
				loginProvider: 'google'
			}
		}
	});
}
