"use client";

import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bus,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  ExternalLink,
  Footprints,
  LocateFixed,
  Map,
  MapPin,
  Navigation,
  Printer,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type {
  CircleMarker,
  Map as LeafletMap,
  Marker,
  Polyline,
} from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORY_META,
  FALL_2026_PLAN,
  OFFICIAL_LINKS,
  PLACES,
  type Place,
  type PlaceCategory,
} from "./data";
import { fetchWalkingRoute, type RouteResult } from "./route-client";

type OriginMode = "edens" | "current";

const EDENS = PLACES.find((place) => place.id === "edens-1a")!;

function confidenceLabel(place: Place) {
  if (place.confidence === "verified") return "Duke 数据核验";
  if (place.confidence === "cross-checked") return "已交叉核验";
  return "课程信息待确认";
}

function mapsLink(place: Place, provider: "google" | "apple") {
  const [lat, lon] = place.coordinates;
  if (provider === "apple") {
    return `https://maps.apple.com/?daddr=${lat},${lon}&dirflg=w`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
}

export default function DukeMapClient() {
  const [selectedId, setSelectedId] = useState("edens-1a");
  const [activeCategory, setActiveCategory] = useState<
    PlaceCategory | "all"
  >("all");
  const [query, setQuery] = useState("");
  const [originMode, setOriginMode] = useState<OriginMode>("edens");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationMessage, setLocationMessage] = useState("");
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeMessage, setRouteMessage] = useState("");
  const [sheetOpen, setSheetOpen] = useState(true);
  const [showSources, setShowSources] = useState(false);

  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Record<string, Marker>>({});
  const routeLayerRef = useRef<Polyline | null>(null);
  const userMarkerRef = useRef<CircleMarker | null>(null);

  const selectedPlace =
    PLACES.find((place) => place.id === selectedId) ?? EDENS;

  const filteredPlaces = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return PLACES.filter((place) => {
      const categoryMatches =
        activeCategory === "all" || place.category === activeCategory;
      const queryMatches =
        !normalized ||
        `${place.name} ${place.shortName} ${place.categoryLabel} ${place.room ?? ""}`
          .toLowerCase()
          .includes(normalized);
      return categoryMatches && queryMatches;
    });
  }, [activeCategory, query]);

  useEffect(() => {
    let cancelled = false;

    async function initialiseMap() {
      if (!mapNodeRef.current || mapRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !mapNodeRef.current) return;

      const map = L.map(mapNodeRef.current, {
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
      }).setView([36.0013, -78.9397], 16);

      L.control.zoom({ position: "topright" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      for (const place of PLACES) {
        const meta = CATEGORY_META[place.category];
        const marker = L.marker(place.coordinates, {
          title: place.name,
          alt: place.name,
          icon: L.divIcon({
            className: "duke-pin-shell",
            html: `<span class="duke-pin" style="--pin:${meta.color};--pin-soft:${meta.soft}"><b>${place.markerLabel}</b></span>`,
            iconSize: [44, 52],
            iconAnchor: [22, 48],
          }),
        }).addTo(map);

        marker.on("click", () => {
          setSelectedId(place.id);
          setSheetOpen(true);
        });
        markerRefs.current[place.id] = marker;
      }

      mapRef.current = map;
      window.setTimeout(() => map.invalidateSize(), 50);
    }

    initialiseMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRefs.current = {};
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const place of PLACES) {
      const marker = markerRefs.current[place.id];
      if (!marker) continue;
      const shouldShow =
        activeCategory === "all" || place.category === activeCategory;
      if (shouldShow && !map.hasLayer(marker)) marker.addTo(map);
      if (!shouldShow && map.hasLayer(marker)) marker.removeFrom(map);
    }
  }, [activeCategory]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRefs.current[selectedPlace.id];
    if (!map || !marker) return;
    if (!map.hasLayer(marker)) {
      setActiveCategory("all");
      marker.addTo(map);
    }
    map.flyTo(selectedPlace.coordinates, 17, { duration: 0.65 });
  }, [selectedPlace]);

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("这台设备不支持定位。");
      return;
    }

    setLocationMessage("正在获取当前位置…");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const point: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(point);
        setOriginMode("current");
        setLocationMessage("已使用你当前的位置。");

        const map = mapRef.current;
        if (map) {
          const L = await import("leaflet");
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(point);
          } else {
            userMarkerRef.current = L.circleMarker(point, {
              radius: 8,
              color: "#ffffff",
              weight: 3,
              fillColor: "#1677ff",
              fillOpacity: 1,
            })
              .bindTooltip("你在这里")
              .addTo(map);
          }
          map.flyTo(point, 17, { duration: 0.6 });
        }
      },
      () => {
        setOriginMode("edens");
        setLocationMessage("定位未开启，已继续使用 Edens 1A。");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }

  async function buildWalkingRoute() {
    const origin =
      originMode === "current" && userLocation
        ? userLocation
        : EDENS.coordinates;
    const destination = selectedPlace.coordinates;

    if (selectedPlace.id === "edens-1a" && originMode === "edens") {
      setRoute(null);
      setRouteMessage("Edens 1A 已经是路线起点。");
      return;
    }

    setRouteLoading(true);
    setRouteMessage("");

    try {
      const result = await fetchWalkingRoute(origin, destination);

      setRoute(result);
      const L = await import("leaflet");
      const map = mapRef.current;
      if (map) {
        if (routeLayerRef.current) routeLayerRef.current.remove();
        routeLayerRef.current = L.polyline(result.points, {
          color: "#012169",
          weight: 6,
          opacity: 0.96,
          lineJoin: "round",
        }).addTo(map);
        map.fitBounds([origin, destination], {
          paddingTopLeft: [60, 110],
          paddingBottomRight: [60, 210],
          maxZoom: 18,
        });
      }
    } catch (error) {
      setRoute(null);
      setRouteMessage(
        error instanceof Error
          ? error.message
          : "步行路线暂时无法加载，请使用外部地图。",
      );
    } finally {
      setRouteLoading(false);
    }
  }

  function clearRoute() {
    setRoute(null);
    setRouteMessage("");
    routeLayerRef.current?.remove();
    routeLayerRef.current = null;
  }

  function choosePlace(place: Place) {
    setSelectedId(place.id);
    setSheetOpen(true);
    clearRoute();
  }

  return (
    <main className="map-app">
      <section className="map-stage" aria-label="Duke West Campus 互动地图">
        <div ref={mapNodeRef} className="leaflet-map" />
        <div className="map-wash" aria-hidden="true" />

        <header className="mobile-map-header">
          <div className="mobile-mark">KD</div>
          <div>
            <strong>Klein&apos;s Duke Map</strong>
            <span>West Campus · V2</span>
          </div>
          <button
            type="button"
            className="round-icon-button"
            onClick={useCurrentLocation}
            aria-label="使用当前位置"
          >
            <LocateFixed size={18} />
          </button>
        </header>

        <nav className="mobile-category-strip" aria-label="地点筛选">
          <button
            type="button"
            className={activeCategory === "all" ? "active" : ""}
            onClick={() => setActiveCategory("all")}
          >
            全部
          </button>
          {(Object.keys(CATEGORY_META) as PlaceCategory[]).map((category) => (
            <button
              type="button"
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {CATEGORY_META[category].label}
            </button>
          ))}
        </nav>

        <div className="map-accuracy-pill">
          <BadgeCheck size={15} />
          {PLACES.length} 个固定核验点 · 不再实时猜坐标
        </div>
      </section>

      <aside className={`control-panel ${sheetOpen ? "sheet-open" : ""}`}>
        <button
          type="button"
          className="sheet-handle"
          aria-label={sheetOpen ? "收起详情" : "展开详情"}
          onClick={() => setSheetOpen((open) => !open)}
        >
          <span />
          {sheetOpen ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
        </button>

        <div className="panel-scroll">
          <header className="brand-row">
            <div className="brand-mark">KD</div>
            <div>
              <h1>Klein&apos;s Duke Map</h1>
              <p>West Campus · Fall 2026 · V2</p>
            </div>
            <button
              type="button"
              className="round-icon-button desktop-locate"
              onClick={useCurrentLocation}
              aria-label="使用当前位置"
            >
              <LocateFixed size={18} />
            </button>
          </header>

          <div className="trust-banner">
            <BadgeCheck size={19} />
            <div>
              <strong>准确性优先</strong>
              <span>固定入口点 + 行人步道路线 + 官方来源日期</span>
            </div>
          </div>

          <label className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索地点、课程或教室"
              aria-label="搜索地点、课程或教室"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="清除搜索"
              >
                <X size={16} />
              </button>
            )}
          </label>

          <div className="category-tabs" aria-label="地点分类">
            <button
              type="button"
              className={activeCategory === "all" ? "active" : ""}
              onClick={() => setActiveCategory("all")}
            >
              全部
            </button>
            {(Object.keys(CATEGORY_META) as PlaceCategory[]).map((category) => (
              <button
                type="button"
                key={category}
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}
              >
                {CATEGORY_META[category].label}
              </button>
            ))}
          </div>

          <section className="place-list-section">
            <div className="section-heading">
              <span>常用地点</span>
              <small>{filteredPlaces.length} 个</small>
            </div>
            <div className="place-list">
              {filteredPlaces.map((place) => {
                const meta = CATEGORY_META[place.category];
                return (
                  <button
                    type="button"
                    key={place.id}
                    className={`place-row ${selectedPlace.id === place.id ? "active" : ""}`}
                    onClick={() => choosePlace(place)}
                  >
                    <span
                      className="place-glyph"
                      style={{ color: meta.color, background: meta.soft }}
                    >
                      {place.markerLabel}
                    </span>
                    <span className="place-copy">
                      <strong>{place.shortName}</strong>
                      <small>
                        {place.categoryLabel}
                        {place.room ? ` · ${place.room}` : ""}
                      </small>
                    </span>
                    <ArrowRight size={16} />
                  </button>
                );
              })}
              {filteredPlaces.length === 0 && (
                <div className="empty-search">
                  <MapPin size={20} />
                  <strong>当前核验清单里没有这个地点</strong>
                  <span>为避免错误坐标，V2 暂不进行模糊网络搜索。</span>
                  <a
                    href="https://maps.duke.edu/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    去 Duke 官方地图搜索
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          </section>

          <section className="detail-card" aria-live="polite">
            <div className="detail-topline">
              <span
                className="category-badge"
                style={{
                  color: CATEGORY_META[selectedPlace.category].color,
                  background: CATEGORY_META[selectedPlace.category].soft,
                }}
              >
                {selectedPlace.categoryLabel}
              </span>
              <span
                className={`confidence-badge confidence-${selectedPlace.confidence}`}
              >
                {selectedPlace.confidence === "review" ? (
                  <CircleAlert size={13} />
                ) : (
                  <BadgeCheck size={13} />
                )}
                {confidenceLabel(selectedPlace)}
              </span>
            </div>

            <h2>{selectedPlace.name}</h2>
            <p className="detail-summary">{selectedPlace.summary}</p>

            <ul className="fact-list">
              {selectedPlace.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>

            <div className="origin-control">
              <span>路线起点</span>
              <div role="group" aria-label="路线起点">
                <button
                  type="button"
                  className={originMode === "edens" ? "active" : ""}
                  onClick={() => {
                    setOriginMode("edens");
                    clearRoute();
                  }}
                >
                  Edens 1A
                </button>
                <button
                  type="button"
                  className={originMode === "current" ? "active" : ""}
                  onClick={useCurrentLocation}
                >
                  <LocateFixed size={14} />
                  当前位置
                </button>
              </div>
            </div>

            {locationMessage && (
              <p className="inline-message">{locationMessage}</p>
            )}

            <button
              type="button"
              className="primary-route-button"
              onClick={buildWalkingRoute}
              disabled={routeLoading}
            >
              <Footprints size={19} />
              {routeLoading ? "正在计算校园步道…" : "规划校园步行路线"}
            </button>

            {routeMessage && (
              <div className="route-warning">
                <CircleAlert size={17} />
                {routeMessage}
              </div>
            )}

            {route && (
              <div className="route-result">
                <div className="route-summary">
                  <span>
                    <Clock3 size={17} />
                    <strong>{route.durationMinutes}</strong> 分钟
                  </span>
                  <span>
                    <Navigation size={17} />
                    <strong>{route.distanceKm.toFixed(2)}</strong> km
                  </span>
                  <button type="button" onClick={clearRoute}>
                    清除
                  </button>
                </div>
                <ol className="route-steps">
                  {route.steps.slice(0, 5).map((step, index) => (
                    <li key={`${step.instruction}-${index}`}>
                      <span>{index + 1}</span>
                      <div>
                        <strong>{step.instruction}</strong>
                        <small>{step.distanceMeters} m</small>
                      </div>
                    </li>
                  ))}
                </ol>
                <p>{route.engine} · 路线仍应以现场封路和标识为准</p>
              </div>
            )}

            <div className="external-route-links">
              <a
                href={mapsLink(selectedPlace, "apple")}
                target="_blank"
                rel="noreferrer"
              >
                Apple Maps
                <ExternalLink size={14} />
              </a>
              <a
                href={mapsLink(selectedPlace, "google")}
                target="_blank"
                rel="noreferrer"
              >
                Google Maps
                <ExternalLink size={14} />
              </a>
            </div>

            {selectedPlace.links?.map((link) => (
              <a
                className="source-action"
                href={link.url}
                target="_blank"
                rel="noreferrer"
                key={link.url}
              >
                {link.label}
                <ExternalLink size={14} />
              </a>
            ))}

            <button
              type="button"
              className="source-toggle"
              onClick={() => setShowSources((show) => !show)}
            >
              <BadgeCheck size={15} />
              数据来源与核验日期
              {showSources ? (
                <ChevronUp size={15} />
              ) : (
                <ChevronDown size={15} />
              )}
            </button>
            {showSources && (
              <div className="source-detail">
                <a
                  href={selectedPlace.source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {selectedPlace.source.label}
                  <ExternalLink size={13} />
                </a>
                <span>核验：{selectedPlace.source.checkedAt}</span>
                {selectedPlace.address && (
                  <span>地址：{selectedPlace.address}</span>
                )}
              </div>
            )}
          </section>

          <section className="schedule-card">
            <div className="section-heading">
              <span>Fall 2026 课程动线</span>
              <small>以 DukeHub 为准</small>
            </div>
            {FALL_2026_PLAN.map((day) => (
              <div className="schedule-day" key={day.day}>
                <strong>{day.day}</strong>
                {day.items.map((item) => {
                  const place = PLACES.find(
                    (candidate) => candidate.id === item.placeId,
                  )!;
                  return (
                    <button
                      type="button"
                      key={`${day.day}-${item.course}`}
                      onClick={() => choosePlace(place)}
                    >
                      <span>{item.time}</span>
                      <div>
                        <strong>{item.course}</strong>
                        <small>{place.shortName}</small>
                      </div>
                      <MapPin size={15} />
                    </button>
                  );
                })}
              </div>
            ))}
          </section>

          <section className="official-links-card">
            <div className="official-title">
              <Sparkles size={17} />
              实时信息交给官方
            </div>
            <div>
              {OFFICIAL_LINKS.map((link) => (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  key={link.url}
                >
                  {link.label}
                  <ExternalLink size={13} />
                </a>
              ))}
            </div>
          </section>

          <footer className="panel-footer">
            <span>
              <Map size={14} />
              地图 © OpenStreetMap
            </span>
            <span>
              <Bus size={14} />
              校车 © Duke / TransLoc
            </span>
            <span>
              <Printer size={14} />
              设施 © Duke ePrint
            </span>
            <span>
              <BookOpen size={14} />
              课程需 DukeHub 确认
            </span>
          </footer>
        </div>
      </aside>
    </main>
  );
}
