import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
  NativeMediaAspectRatio,
  NativeAdChoicesPlacement,
  TestIds,
} from "react-native-google-mobile-ads";

const LIVE_UNIT_ID = "ca-app-pub-4289098365837690/4760411931"; // your Discover Experience (Native) unit
const UNIT_ID = __DEV__ ? TestIds.NATIVE : LIVE_UNIT_ID;

export default function DiscoverNativeAd() {
  const [nativeAd, setNativeAd] = useState<NativeAd | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    // Load one native ad
    (async () => {
      try {
        const ad = await NativeAd.createForAdRequest(UNIT_ID, {
          aspectRatio: NativeMediaAspectRatio.LANDSCAPE,
          adChoicesPlacement: NativeAdChoicesPlacement.TOP_RIGHT,
          // keywords: ["events", "travel", "culture"], // optional
        });
        if (isMounted) setNativeAd(ad);
      } catch (e) {
        console.warn("Failed to load native ad", e);
      }
    })();

    return () => {
      isMounted = false;
      if (nativeAd) nativeAd.destroy();
    };
  }, []);

  if (!nativeAd) return null;

  return (
    <NativeAdView nativeAd={nativeAd} style={styles.card}>
      {/* Icon */}
      {nativeAd.icon?.url ? (
        <NativeAsset assetType={NativeAssetType.ICON}>
          <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
        </NativeAsset>
      ) : null}

      {/* Headline */}
      <NativeAsset assetType={NativeAssetType.HEADLINE}>
        <Text style={styles.headline}>{nativeAd.headline}</Text>
      </NativeAsset>

      {/* Media (image/video) */}
      <NativeMediaView style={styles.media} />

      {/* Body */}
      {nativeAd.body ? (
        <NativeAsset assetType={NativeAssetType.BODY}>
          <Text style={styles.body}>{nativeAd.body}</Text>
        </NativeAsset>
      ) : null}

      {/* CTA */}
      {nativeAd.cta ? (
        <NativeAsset assetType={NativeAssetType.CTA}>
          <Text style={styles.cta}>{nativeAd.cta}</Text>
        </NativeAsset>
      ) : null}

      {/* Required attribution */}
      <Text style={styles.sponsored}>Sponsored</Text>
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    padding: 12,
    gap: 8,
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginTop: 16,
  },
  icon: { width: 40, height: 40, borderRadius: 8 },
  headline: { fontSize: 18, fontWeight: "700", color: "#111827" },
  media: { width: "100%", aspectRatio: 16 / 9, borderRadius: 12 },
  body: { fontSize: 14, color: "#374151" },
  cta: {
    marginTop: 8,
    paddingVertical: 10,
    textAlign: "center",
    borderRadius: 10,
    backgroundColor: "#111827",
    color: "#fff",
    fontWeight: "700",
  },
  sponsored: { marginTop: 6, fontSize: 12, color: "#6B7280" },
});
