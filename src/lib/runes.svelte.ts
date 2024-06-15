// import { getContext, hasContext, onMount, setContext } from 'svelte';
import { onMount } from 'svelte';
// import { readable, writable } from 'svelte/store';

// https://github.com/microsoft/TypeScript/issues/1897#issuecomment-2014034208
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type Valuable<StoredValue> = { value: StoredValue };

// // https://dev.to/jdgamble555/using-sharable-runes-with-typescript-in-svelte5-5hcp
// export const reusableStateRune = <StoredValue>(initialValue: StoredValue): Valueable<StoredValue> => {
// 	let _value = $state(initialValue);

// 	return {
// 		get value() {
// 			return _value;
// 		},

// 		set value(newValue: StoredValue) {
// 			_value = newValue;
// 		}
// 	};
// };

// // https://dev.to/jdgamble555/using-sharable-runes-with-typescript-in-svelte5-5hcp
// export const useSharedGenericStore = <StoredValue, InitialValue>(
// 	context: string,
// 	storeFactory: (initialValue?: InitialValue) => StoredValue,
// 	initialValue?: InitialValue
// ) => {
// 	if (hasContext(name)) {
// 		return getContext<StoredValue>(name);
// 	}

// 	const _value = storeFactory(initialValue);
// 	setContext(context, _value);
// 	return _value;
// };

// // https://dev.to/jdgamble555/using-sharable-runes-with-typescript-in-svelte5-5hcp
// export const useSharedWritable = <StoredValue>(context: string, initialValue?: StoredValue) => {
// 	return useSharedGenericStore(context, writable, initialValue);
// };

// // https://dev.to/jdgamble555/using-sharable-runes-with-typescript-in-svelte5-5hcp
// export const useSharedReadable = <StoredValue>(context: string, initialValue?: StoredValue) => {
// 	return useSharedGenericStore(context, readable, initialValue);
// };

// // https://dev.to/jdgamble555/using-sharable-runes-with-typescript-in-svelte5-5hcp
// export const useSharedRune = <StoredValue>(context: string, initialValue?: StoredValue) => {
// 	return useSharedGenericStore(context, reusableStateRune, initialValue);
// };

// https://userunes.com/uselocalstorage
export const useLocalStorageRune = <StoredJson extends Json>(
	key: string,
	initialValue: StoredJson
): Valuable<StoredJson> => {
	let _value = $state<StoredJson>(initialValue);

	onMount(() => {
		const currentValue = localStorage.getItem(key);
		if (currentValue) {
			_value = JSON.parse(currentValue);
		}
	});

	const save = () => {
		if (_value) {
			localStorage.setItem(key, JSON.stringify(_value));
		} else {
			localStorage.removeItem(key);
		}
	};

	return {
		get value() {
			return _value;
		},

		set value(newValue: StoredJson) {
			_value = newValue;
			save();
		},
	};
};
