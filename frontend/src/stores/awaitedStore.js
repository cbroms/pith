import { derived, readable } from "svelte/store";

export const awaitedStore = (stores, createStore, defaultValues) => {
	return readable(defaultValues, (set) => {
		let unsubscribe;

		// subscribe to the stores before
		const unsubscribeFromInitial = derived(
			stores,
			(values) => values
		).subscribe((values) => {
			// cleanup the previous version by unsubscribing
			if (unsubscribe) {
				unsubscribe();
				unsubscribe = undefined;
			}
			if (values === undefined) {
				// update even when undefined
				set(defaultValues);
				return;
			}
			unsubscribe = createStore(values).subscribe((chainedValues) => {
				if (chainedValues === undefined) {
					// update when we unsubscribe
					set(defaultValues);
					return;
				}
				set(chainedValues);
			});
		});

		return () => {
			unsubscribeFromInitial();
			if (unsubscribe) {
				unsubscribe();
				unsubscribe = undefined;
			}
		};
	});
};
