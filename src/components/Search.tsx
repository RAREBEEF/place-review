import styles from "./Search.module.scss";
import classNames from "classnames";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentPos, setMarkerPos } from "../redux/modules/getMap";
import {
  getMapStateType,
  paginationStateType,
  SearchPropType,
  stateType,
} from "../types";
import { Routes, Route } from "react-router-dom";
import FindReview from "./FindReview";
import WriteReview from "./WriteReview";
import Button from "./Button";
import SearchResult from "./SearchResult";
import { setFilter } from "../redux/modules/getReviews";

const Search: React.FC<SearchPropType> = (): ReactElement => {
  const dispatch = useDispatch();
  const {
    loading,
    data: { map, places, geocoder },
    currentPos,
  } = useSelector((state: stateType): getMapStateType => state.getMap);
  const [searchText, setSearchText] = useState<string | number>("");
  const [searchResult, setSearchResult] = useState<Array<any>>([]);
  const [isZero, setIsZero] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [pagination, setPagination] = useState<paginationStateType>({
    nextClick: () => {},
    prevClick: () => {},
    totalCount: 0,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selected, setSelected] = useState<any>({ section: null, index: null });
  const listElRef = useRef<any>(null);

  // 검색 콜백
  // 검색 결과(검색 내용, 내용 없음, 검색 실패)를 처리하고 페이지네이션 생성
  const searchCallback = useCallback(
    (result: Array<any>, status: string, pagination: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setError(false);
        setIsZero(false);
        setSearchResult(result);
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
        nextClick: (): void => {
          if (pagination.hasNextPage) {
            setSelected({ section: null, index: null });
            setCurrentPage((prevState: number): number => prevState + 1);
            pagination.nextPage();
            listElRef.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        },
        prevClick: (): void => {
          if (pagination.hasPrevPage) {
            setSelected({ section: null, index: null });
            setCurrentPage((prevState: number): number => prevState - 1);
            pagination.prevPage();
            listElRef.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        },
        totalCount: pagination.totalCount,
      });
    },
    []
  );

  // 검색 실행
  const search = useCallback(
    (keyword: string | number): void => {
      places.keywordSearch(keyword, searchCallback, {
        location: currentPos,
      });
    },
    [places, searchCallback, currentPos]
  );

  // 검색어 Submit
  const onSubmit = useCallback(
    (e): void => {
      e.preventDefault();

      setCurrentPage(1);
      setSelected({ section: null, index: null });

      if (searchText === "") {
        map.setCenter(currentPos);
        dispatch(setMarkerPos(currentPos));
      } else if (searchText !== "") {
        search(searchText);
      }
    },
    [searchText, map, currentPos, dispatch, search]
  );

  // 검색어 입력
  const onKeywordChange = useCallback((e): void => {
    e.preventDefault();

    setSearchText(e.target.value);
  }, []);

  // 현위치 클릭 시 처리할 로직
  const searchAndMove = useCallback(
    (location: any): void => {
      map.setCenter(location);
      dispatch(setMarkerPos(location));
      setCurrentPage(1);
      setSelected({ section: "place", index: 0 });
      dispatch(setFilter("HERE"));
      if (Object.keys(geocoder).length !== 0 && location !== null) {
        geocoder.coord2Address(
          location.getLng(),
          location.getLat(),
          (result: Array<any>, status: string) => {
            if (status === window.kakao.maps.services.Status.OK) {
              search(result[0].address.address_name);
              setSearchText(result[0].address.address_name);
            }
          }
        );
      }
    },
    [dispatch, geocoder, search, map]
  );

  // 현위치 버튼 클릭 핸들러
  // 위치 정보에 액세스 시도 및 성공 시 바로 위 함수 실행
  const onCurrentPosBtnClick = useCallback(
    (e?): void => {
      e?.preventDefault();

      if (currentPos === null) {
        const ok = window.confirm(
          "사용자의 위치 정보를 사용하게 됩니다.\n최초 실행 시 몇 초 정도 시간이 소요될 수 있습니다.\n\n(작동하지 않을 경우 브라우저 설정에서 위치 정보 액세스 차단 여부를 확인해 주세요.)"
        );
        if (ok) {
          window.navigator.geolocation.getCurrentPosition(
            async (pos): Promise<void> => {
              try {
                const location = new window.kakao.maps.LatLng(
                  pos.coords.latitude,
                  pos.coords.longitude
                );
                dispatch(setCurrentPos(location));
                searchAndMove(location);
              } catch (error) {
                console.log(error);
              }
            }
          );
        } else {
          return;
        }
      } else {
        searchAndMove(currentPos);
      }
    },
    [currentPos, dispatch, searchAndMove]
  );

  // 현위치 정보가 있으면 컴포넌트가 마운트될 때 현위치로 이동
  useEffect((): void => {
    if (Object.keys(geocoder).length !== 0 && currentPos !== null) {
      onCurrentPosBtnClick();
    }
  }, [currentPos, geocoder, onCurrentPosBtnClick]);

  // 지도 드래그 이벤트
  // 드래그가 종료될 때 지도 중심 위치 검색
  useEffect((): void => {
    const dragCallback = (): void => {
      const location = map.getCenter();

      geocoder.coord2Address(
        location.getLng(),
        location.getLat(),
        (result: Array<any>, status: string): void => {
          if (status === window.kakao.maps.services.Status.OK) {
            setSelected({ section: null, index: null });
            setCurrentPage(1);
            search(result[0].address.address_name);
            setSearchText(result[0].address.address_name);
            dispatch(setMarkerPos(location));
          }
        }
      );
    };

    if (Object.keys(map).length !== 0) {
      window.kakao.maps.event.addListener(map, "dragend", dragCallback);
    }
  }, [dispatch, geocoder, search, map]);

  // 리뷰 위치 검색(리뷰 클릭 시 실행)
  const searchReviewPos = useCallback(
    (location, i): void => {
      geocoder.coord2Address(
        location.getLng(),
        location.getLat(),
        (result: Array<any>, status: string): void => {
          if (status === window.kakao.maps.services.Status.OK) {
            setSelected({ section: "review", index: i });
            setCurrentPage(1);
            search(result[0].address.address_name);
            setSearchText(result[0].address.address_name);
          }
        }
      );
    },
    [geocoder, search]
  );

  return (
    <div className={classNames(styles.container, loading && styles.loading)}>
      <form className={styles.form} onSubmit={onSubmit}>
        <input
          className={classNames(styles["input--search"])}
          type="text"
          value={searchText}
          onChange={onKeywordChange}
          placeholder="장소 검색"
        />
        <div className={styles["btn-wrapper"]}>
          <Button text="검색" className={["Search__search"]} />
          <Button
            onClick={onCurrentPosBtnClick}
            text="현위치"
            className={["Search__current-pos"]}
          />
        </div>
      </form>
      <div className={styles["result"]}>
        {error ? (
          <div className={styles["result__error"]}>
            오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </div>
        ) : isZero ? (
          <div className={styles["result__zero"]}>검색 결과가 없습니다.</div>
        ) : (
          <ul className={styles["result__list"]} ref={listElRef}>
            {searchResult.map((el: any, i: any) => (
              <SearchResult
                key={i}
                i={i}
                selected={selected}
                setSelected={setSelected}
                place={el}
              />
            ))}
          </ul>
        )}
        <div className={styles["result__pagination"]}>
          <Button
            onClick={pagination.prevClick}
            text="prev"
            className={["Search__prev"]}
          />
          <span className={styles["pagination__count"]}>
            {currentPage} /{" "}
            {Math.ceil(pagination.totalCount / 15) === 0
              ? 1
              : Math.ceil(pagination.totalCount / 15)}
          </span>
          <Button
            onClick={pagination.nextClick}
            text="next"
            className={["Search__next"]}
          />
        </div>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <FindReview
              onCurrentPosBtnClick={onCurrentPosBtnClick}
              selected={selected}
              setSelected={setSelected}
              searchReviewPos={searchReviewPos}
            />
          }
        ></Route>
        <Route
          path="/new"
          element={
            <WriteReview searchResult={searchResult} selected={selected} />
          }
        ></Route>
      </Routes>
    </div>
  );
};

export default Search;
