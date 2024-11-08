import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Categories from "../../components/Categories";
import { apiCall } from "../../api";
import ImageGrid from "../../components/ImageGrid";
import {debounce} from 'lodash';
import FiltersModal from "../../components/FiltersModal";

var page = 1;

const HomeScreen = () => {
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 10 : 30;
  const [search, setSearch] = useState("");
  const [images, setImages] = useState([]);
  const [filters, setFilters] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async (params = {page: 1}, append = false) => {
    console.log('params:', params, append);
    let res = await apiCall(params);
    if( res.success && res?.data?.hits) {
      if(append)
        setImages([...images, ...res.data.hits]);
      else
        setImages([...res.data.hits]);
    }
  };

  const openFiltersModal = () => {
    modalRef?.current?.present();
  };

  const closeFiltersModal = () => {
    modalRef?.current?.close();
  };

  const applyFilters = () => {
    if(filters) {
      page = 1;
      setImages([]);
      let params = {
        page,
        ...filters,
      }
      if(activeCategory) params.category = activeCategory;
      if(search) params.q = search;
      fetchImages(params, false);
    }
    closeFiltersModal();
  };

  const resetFilters = () => {
    if(filters) {
      page = 1;
      setFilters(null);
      setImages([]);
      let params = {
        page,
      }
      if(activeCategory) params.category = activeCategory;
      if(search) params.q = search;
      fetchImages(params, false);
    }
    closeFiltersModal();
  };

  const handleChangeCategory = (cat) => {
    setActiveCategory(cat);
    clearSearch();
    setImages([]);
    page = 1;
    let params = {
      page,
      ...filters
    }
    if(cat) params.category = cat;
    fetchImages(params, false);
  };

  const handleSearch = (text) => {
    setSearch(text);
    if(text.length > 2) {
      //search for this text
      page = 1;
      setImages([]);
      setActiveCategory(null); //clear category when searching
      fetchImages({page, q: text, ...filters}, false);
    }
    if(text == "") {
      //reset results
      page = 1;
      searchInputRef?.current?.clear();
      setImages([]);
      setActiveCategory(null); //clear category when searching
      fetchImages({page, ...filters}, false);
    }
  };

  const clearSearch = () => {
    setSearch("");
    searchInputRef?.current?.clear();
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 400), []);

  console.log("Filters: ", filters);

  return (
    <View style={[styles.container, { paddingTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable>
          <Text style={styles.title}>Pixels</Text>
        </Pressable>
        <Pressable onPress={openFiltersModal}>
          <FontAwesome6
            name="bars-staggered"
            size={22}
            colors={theme.colors.neutral(0.7)}
          />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ gap: 15 }}>
        {/* search bar */}
        <View style={styles.searchBar}>
          <View style={styles.searchIcon}>
            <Feather
              name="search"
              size={24}
              color={theme.colors.neutral(0.4)}
            />
          </View>
          <TextInput
            placeholder="Search for photos"
            // value={search}
            onChangeText={handleTextDebounce}
            ref={searchInputRef}
            style={styles.searchInput}
          />
          {search && (
            <Pressable onPress={() => handleSearch("")} style={styles.closeIcon}>
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.neutral(0.6)}
              />
            </Pressable>
          )}
        </View>

        {/* Categories */}
        <View style={styles.categories}>
            <Categories activeCategory={activeCategory} handleChangeCategory={handleChangeCategory} />
        </View>

        {/* filters */}

        {/* images masonry grid*/}
          <View>
            {
              images.length > 0 && <ImageGrid images={images}/>
            }
          </View>
          {/* loading animation */}
          <View style={{marginBottom: 70, marginTop: images.length > 0 ? 10 : 70}}>
            <ActivityIndicator size="large" />
          </View>
      </ScrollView>
      {/* filters modal */}
      <FiltersModal modalRef={modalRef} filters={filters} setFilters={setFilters}
      onClose={closeFiltersModal} onApply={applyFilters} onReset={resetFilters}/>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
  },
  header: {
    marginHorizontal: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: hp(4),
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral(0.9),
  },
  searchBar: {
    marginHorizontal: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.grayBG,
    backgroundColor: theme.colors.white,
    padding: 6,
    paddingLeft: 10,
    borderRadius: theme.radius.lg,
  },
  searchIcon: {
    padding: 8,
  },
  searchInput: {
    flex: 1,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    fontSize: hp(1.8),
  },
  closeIcon: {
    backgroundColor: theme.colors.neutral(0.1),
    padding: 8,
    borderRadius: theme.radius.sm,
  },
});
