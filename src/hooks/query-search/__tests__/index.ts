import { shallowMount } from '@vue/test-utils';
import { toRefs } from 'vue';

import { useQuerySearch } from '@/hooks/query-search';

describe('useQuerySearch', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = shallowMount({
            props: {
                focused: Boolean,
                searchText: String,
            },
            setup(props) {
                const { state } = useQuerySearch(props);
                return { ...toRefs(state) };
            },
        }, {
            propsData: {
                focused: true,
            },
        });
    });
    test('1', () => {
        expect(wrapper.vm.isFocused).toBe(true);
    });
});
