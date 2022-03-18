import styles from "./Search.module.scss";
import classNames from "classnames";
import { ReactElement, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMarkerPos } from "../redux/modules/getMap";
import {
  mapDataType,
  paginationStateType,
  recentSearchStateType,
} from "../types";

const Search: React.FC = (): ReactElement => {
  const dispatch = useDispatch();
  const { loading, data } = useSelector((state: mapDataType) => state);

  const map = data.map;
  const places = data.places;
  const geocoder = data.geocoder;

  const [keyword, setKeyword] = useState<string | number>("");
  const [address, setAddress] = useState<string | number>("");
  const [recentSearch, setRecentSearch] = useState<recentSearchStateType>({
    text: "",
    type: "",
  });

  const [searchResult, setSearchResult] = useState<Array<any>>([]);
  const [isZero, setIsZero] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const [pagination, setPagination] = useState<paginationStateType>({
    nextClick: () => {},
    prevClick: () => {},
    totalCount: 0,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [selected, setSelected] = useState<number>(0);

  // 검색 콜백
  const searchCallback = useCallback(
    (result: any, status: any, pagination: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setError(false);
        setIsZero(false);
        setSearchResult(result);
        const { x, y } = result[0];
        const location = new window.kakao.maps.LatLng(y, x);
        map.panTo(location);
        dispatch(setMarkerPos(location));
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        setError(false);
        setIsZero(true);
        setSearchResult([]);
      } else {
        setSearchResult([]);
        setError(true);
        setIsZero(false);
      }

      setPagination({
        nextClick: () => {
          if (pagination.hasNextPage) {
            setCurrentPage((prevState) => prevState + 1);
            pagination.nextPage();
          }
        },
        prevClick: () => {
          if (pagination.hasPrevPage) {
            setCurrentPage((prevState) => prevState - 1);
            pagination.prevPage();
          }
        },
        totalCount: pagination.totalCount,
      });
    },
    [map]
  );

  // 장소 검색
  const keywordSearch = useCallback(
    (keyword: string | number) => {
      setCurrentPage(1);
      places.keywordSearch(keyword, searchCallback, {
        location: map.getCenter(),
      });
    },
    [places, searchCallback, map]
  );

  // 주소 검색
  const addressSearch = useCallback(
    (keyword: string | number) => {
      setCurrentPage(1);
      geocoder.addressSearch(keyword, searchCallback, {
        location: map.getCenter(),
      });
    },
    [geocoder, searchCallback, map]
  );

  // 장소 검색 submit
  const onKeywordSubmit = useCallback(
    (e) => {
      e.preventDefault();
      keywordSearch(keyword);
      setRecentSearch({ text: keyword, type: "장소" });
      setKeyword("");
    },
    [keywordSearch, keyword]
  );

  // 주소 검색 submit
  const onAddressSubmit = useCallback(
    (e) => {
      e.preventDefault();
      addressSearch(address);
      setRecentSearch({ text: address, type: "주소" });
      setAddress("");
    },
    [addressSearch, address]
  );

  const onKeywordChange = useCallback((e) => {
    e.preventDefault();
    setKeyword(e.target.value);
  }, []);

  const onAddressChange = useCallback((e) => {
    e.preventDefault();
    setAddress(e.target.value);
  }, []);

  return (
    <div className={classNames(styles.container, loading && styles.loading)}>
      <form onSubmit={onKeywordSubmit}>
        <input
          className={classNames(styles.search, styles["search--keyword"])}
          type="text"
          value={keyword}
          onChange={onKeywordChange}
          placeholder="장소 검색"
        />
      </form>
      <form onSubmit={onAddressSubmit}>
        <input
          className={classNames(styles.search, styles["search--address"])}
          type="text"
          value={address}
          onChange={onAddressChange}
          placeholder="주소 검색"
        />
      </form>

      {recentSearch.text.toString().length !== 0 && (
        <div className={styles["result"]}>
          <h2 className={styles["result__header"]}>
            "{recentSearch.text}" 에 대한 {recentSearch.type} 검색 결과
          </h2>
          {error && (
            <div className={styles["result__error"]}>
              오류가 발생했습니다. 잠시후 다시 시도해주세요.
            </div>
          )}
          {isZero ? (
            <div className={styles["result__zero"]}>검색 결과가 없습니다.</div>
          ) : (
            <div>
              <ul>
                {searchResult.map((el: any, i: any) => (
                  <li
                    className={classNames(
                      styles["result__list"],
                      selected === i && styles.selected
                    )}
                    key={i}
                    onClick={() => {
                      map.panTo(new window.kakao.maps.LatLng(el.y, el.x));
                      map.setLevel(3);
                      dispatch(
                        setMarkerPos(new window.kakao.maps.LatLng(el.y, el.x))
                      );
                      setSelected(i);
                    }}
                  >
                    <div className={styles["result__place-name"]}>
                      {el.place_name}
                    </div>
                    <div className={styles["result__address"]}>
                      {el.place_name ? `(${el.address_name})` : el.address_name}
                    </div>
                  </li>
                ))}
              </ul>
              <div className={styles["resut__pagination"]}>
                <button onClick={pagination.prevClick}>prev</button>
                <span>
                  {currentPage} / {Math.ceil(pagination.totalCount / 15)}
                </span>
                <button onClick={pagination.nextClick}>next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
