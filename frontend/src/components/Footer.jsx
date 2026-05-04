/**
 * Footer Component (Premium Animated Farming Footer)
 *
 * Functionality:
 * - Keeps existing membership-wise footer color/theme logic.
 * - Loads active membership from localStorage customerUser email.
 * - Shows newsletter, footer links, contact details and copyright.
 * - Adds CSS-based farming animation background:
 *   farmer walking, cows grazing, clouds floating, grass moving.
 * - Does not require MP4/video file, so it is lightweight and mobile friendly.
 * - Works on desktop and mobile view.
 */

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getActiveMembership } from '../utils/membershipUtils';

function Footer() {
  const [membership, setMembership] = useState(null);

  useEffect(() => {
    const loadMembership = async () => {
      try {
        const customerUser = JSON.parse(localStorage.getItem('customerUser') || 'null');

        if (!customerUser?.email) {
          setMembership(null);
          return;
        }

        const data = await getActiveMembership(customerUser.email);

        if (data?.hasMembership) {
          setMembership(data.membership);
        } else {
          setMembership(null);
        }
      } catch {
        setMembership(null);
      }
    };

    loadMembership();
  }, []);

  const planName = membership?.plan_name || membership?.plan || '';
  const planClass = planName ? String(planName).toLowerCase() : 'normal';

  return (
    <footer className={`premium-footer footer-${planClass}`}>
      <style>{`
        .footer-normal {
          --footer-main: #245633;
          --footer-accent: #d4af37;
          --footer-bg1: #0f321e;
          --footer-bg2: #173f27;
          --footer-bg3: #0a1f13;
          --footer-card: #fff8db;
        }

        .footer-silver {
          --footer-main: #6f7782;
          --footer-accent: #c0c7d1;
          --footer-bg1: #343a40;
          --footer-bg2: #242a30;
          --footer-bg3: #15191d;
          --footer-card: #eef1f5;
        }

        .footer-gold {
          --footer-main: #9a6a00;
          --footer-accent: #d4af37;
          --footer-bg1: #3a2a00;
          --footer-bg2: #5a4100;
          --footer-bg3: #1f1500;
          --footer-card: #fff4c6;
        }

        .footer-platinum {
          --footer-main: #4b2c83;
          --footer-accent: #d4af37;
          --footer-bg1: #2b184a;
          --footer-bg2: #4b2c83;
          --footer-bg3: #140a25;
          --footer-card: #f1e6ff;
        }

        .premium-footer {
          position: relative;
          background: linear-gradient(135deg, var(--footer-bg1) 0%, var(--footer-bg2) 48%, var(--footer-bg3) 100%);
          color: #fff;
          padding: 70px 0;
          overflow: hidden;
          isolation: isolate;
        }

        .premium-footer a:hover {
          color: var(--footer-accent) !important;
        }

        .footer-top-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 130px;
          background:
            radial-gradient(circle at 12% 0%, rgba(212,175,55,0.28), transparent 34%),
            radial-gradient(circle at 88% 0%, rgba(255,255,255,0.16), transparent 36%);
          z-index: 1;
          pointer-events: none;
        }

        .footer-container {
          position: relative;
          z-index: 5;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 22px;
        }

        .footer-newsletter {
          background: linear-gradient(135deg, var(--footer-card) 0%, #ffffff 100%);
          color: #173f27;
          border-radius: 26px;
          padding: 28px;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
          align-items: center;
          box-shadow: 0 20px 45px rgba(0,0,0,0.22);
          margin-bottom: 46px;
          border: 1px solid rgba(255,255,255,0.55);
        }

        .footer-kicker {
          display: inline-block;
          color: var(--footer-main);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 1.5px;
          margin-bottom: 15%;
        }

        .footer-headline {
          margin: 0;
          font-size: 30px;
          line-height: 1.15;
          font-weight: 1000;
          color: #171717;
        }

        .footer-subtext {
          margin: 10px 0 0;
          color: #5f564d;
          font-size: 14px;
          line-height: 1.7;
        }

        .footer-subscribe {
          display: flex;
          background: #fff;
          border: 1px solid #eadfd2;
          border-radius: 16px;
          overflow: hidden;
          height: 54px;
        }

        .footer-subscribe input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0 18px;
          font-size: 14px;
        }

        .footer-subscribe button {
          border: none;
          background: var(--footer-accent);
          color: #171717;
          padding: 0 22px;
          font-weight: 900;
          cursor: pointer;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
          gap: 36px;
        }

        .footer-brand-logo {
          margin: 0;
          color: var(--footer-accent);
          font-size: 34px;
          font-weight: 1000;
          letter-spacing: 1px;
        }

        .footer-brand-sub {
          margin: 2px 0 16px;
          color: var(--footer-accent);
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 4px;
        }

        .footer-text {
          color: #dce8de;
          font-size: 14px;
          line-height: 1.8;
          margin: 0 0 12px;
        }

        .footer-member-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          border: 1px solid var(--footer-accent);
          color: var(--footer-accent);
          font-size: 12px;
          font-weight: 900;
        }

        .footer-title {
          color: var(--footer-accent);
          margin: 0 0 16px;
          font-size: 16px;
          font-weight: 1000;
        }

        .footer-link {
          display: block;
          color: #e9f3eb;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 11px;
        }

        .footer-social-row {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }

        .footer-social-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255,255,255,0.11);
          border: 1px solid rgba(255,255,255,0.18);
          display: grid;
          place-items: center;
          color: var(--footer-accent);
          font-weight: 900;
        }

        .footer-bottom {
          margin-top: 42px;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,0.16);
          color: #c9d8cd;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .footer-bottom-links {
          color: var(--footer-accent);
        }

        /* Animated farming background */
        .farm-animation-stage {
          position: absolute;
          inset: 0;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          opacity: 0.38;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.08) 36%, rgba(245,238,213,0.14) 100%);
        }

        .farm-sky-glow {
          position: absolute;
          left: 50%;
          bottom: 48%;
          width: 680px;
          height: 180px;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(255,230,140,0.18), transparent 70%);
          filter: blur(4px);
        }

        .farm-hill-back {
          position: absolute;
          left: -5%;
          right: -5%;
          bottom: 12%;
          height: 42%;
          background: #86a233;
          clip-path: polygon(0 62%, 16% 42%, 34% 55%, 51% 35%, 70% 56%, 88% 40%, 100% 58%, 100% 100%, 0 100%);
          opacity: 0.92;
        }

        .farm-hill-front {
          position: absolute;
          left: -3%;
          right: -3%;
          bottom: 6%;
          height: 35%;
          background: #bdc947;
          clip-path: polygon(0 48%, 15% 43%, 30% 49%, 46% 58%, 64% 68%, 82% 55%, 100% 50%, 100% 100%, 0 100%);
        }

        .cloud {
          position: absolute;
          top: 16%;
          width: 86px;
          height: 28px;
          background: rgba(255,255,255,0.22);
          border-radius: 999px;
          filter: blur(0.2px);
          animation: cloudMove 20s linear infinite;
        }

        .cloud::before,
        .cloud::after {
          content: '';
          position: absolute;
          background: inherit;
          border-radius: 50%;
        }

        .cloud::before {
          width: 36px;
          height: 36px;
          left: 16px;
          top: -16px;
        }

        .cloud::after {
          width: 28px;
          height: 28px;
          right: 18px;
          top: -11px;
        }

        .cloud-1 {
          left: -120px;
        }

        .cloud-2 {
          left: 45%;
          top: 28%;
          transform: scale(0.75);
          animation-duration: 28s;
          animation-delay: -10s;
        }

        .footer-tree {
          position: absolute;
          bottom: 15%;
          width: 145px;
          height: 170px;
        }

        .footer-tree-left {
          left: 22px;
        }

        .footer-tree-right {
          right: 26px;
          transform: scaleX(-1);
        }

        .tree-trunk {
          position: absolute;
          left: 62px;
          bottom: 0;
          width: 18px;
          height: 92px;
          background: #6a3c1e;
          border-radius: 999px 999px 0 0;
          transform: rotate(12deg);
        }

        .tree-leaf {
          position: absolute;
          background: #385f2a;
          border-radius: 50%;
        }

        .tree-leaf-1 {
          width: 92px;
          height: 70px;
          left: 12px;
          top: 16%;
        }

        .tree-leaf-2 {
          width: 94px;
          height: 72px;
          left: 52px;
          top: 40px;
        }

        .tree-leaf-3 {
          width: 76px;
          height: 62px;
          left: 35px;
          top: 4px;
        }

        .grass-cluster {
          position: absolute;
          bottom: 12%;
          width: 120px;
          height: 70px;
          animation: grassWave 2.6s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .grass-left {
          left: 6px;
        }

        .grass-right {
          right: 10px;
          animation-delay: 0.6s;
        }

        .grass-blade {
          position: absolute;
          bottom: 0;
          width: 12px;
          height: 60px;
          background: #315d25;
          border-radius: 100% 0;
          transform-origin: bottom center;
        }

        .grass-blade:nth-child(1) { left: 10px; transform: rotate(-35deg); }
        .grass-blade:nth-child(2) { left: 30px; transform: rotate(-18deg); height: 74px; }
        .grass-blade:nth-child(3) { left: 52px; transform: rotate(4deg); height: 68px; }
        .grass-blade:nth-child(4) { left: 74px; transform: rotate(22deg); height: 76px; }
        .grass-blade:nth-child(5) { left: 94px; transform: rotate(38deg); height: 58px; }

        .farmer {
          position: absolute;
          left: 25%;
          bottom: 15%;
          width: 92px;
          height: 146px;
          animation: farmerWalk 7.5s ease-in-out infinite alternate;
          transform-origin: bottom center;
        }

        .farmer-head {
          position: absolute;
          left: 36px;
          top: 10px;
          width: 24px;
          height: 24px;
          background: #7d4b27;
          border-radius: 50%;
          box-shadow: inset -4px -3px 0 rgba(0,0,0,0.12);
        }

        .farmer-head::before {
          content: '';
          position: absolute;
          left: -8px;
          top: -8px;
          width: 40px;
          height: 10px;
          background: #d8b24c;
          border-radius: 50%;
          transform: rotate(-8deg);
        }

        .farmer-head::after {
          content: '';
          position: absolute;
          left: 4px;
          top: -14px;
          width: 22px;
          height: 14px;
          background: #d8b24c;
          border-radius: 18px 18px 4px 4px;
        }

        .farmer-body {
          position: absolute;
          left: 30px;
          top: 38px;
          width: 30px;
          height: 70px;
          background: linear-gradient(180deg, #fff6cf 0 32%, #f1c968 33% 100%);
          border-radius: 18px 18px 6px 6px;
          box-shadow: inset -5px 0 0 rgba(0,0,0,0.08);
        }

        .farmer-body::before {
          content: '';
          position: absolute;
          left: -14px;
          top: 18px;
          width: 28px;
          height: 7px;
          background: #7d4b27;
          border-radius: 999px;
          transform: rotate(-22deg);
          animation: farmerArm 1.2s ease-in-out infinite;
          transform-origin: right center;
        }

        .farmer-body::after {
          content: '';
          position: absolute;
          left: 7px;
          bottom: -6px;
          width: 44px;
          height: 10px;
          background: rgba(0,0,0,0.18);
          border-radius: 50%;
          filter: blur(2px);
        }

        .farmer-basket {
          position: absolute;
          left: 2px;
          top: 18px;
          width: 66px;
          height: 28px;
          background: #314f1f;
          border-radius: 50%;
          transform: rotate(-18deg);
        }

        .farmer-basket::before {
          content: '';
          position: absolute;
          left: -8px;
          top: -8px;
          width: 18px;
          height: 18px;
          background: #9db645;
          border-radius: 0 60% 0 60%;
          box-shadow: 18px -6px 0 #9db645, 36px -2px 0 #9db645, 52px 2px 0 #9db645;
        }

        .farmer-leg {
          position: absolute;
          bottom: 0;
          width: 9px;
          height: 48px;
          background: #f1c968;
          border-radius: 999px;
          transform-origin: top center;
        }

        .farmer-leg-1 {
          left: 32px;
          animation: legMoveOne 0.9s ease-in-out infinite;
        }

        .farmer-leg-2 {
          left: 52px;
          animation: legMoveTwo 0.9s ease-in-out infinite;
        }

        .cow {
          position: absolute;
          bottom: 20%;
          width: 126px;
          height: 70px;
          animation: cowGraze 2.4s ease-in-out infinite;
          transform-origin: center bottom;
        }

        .cow-1 {
          right: 16%;
        }

        .cow-2 {
          right: 5%;
          bottom: 28%;
          transform: scale(0.72);
          animation-delay: 0.8s;
        }

        .cow-body {
          position: absolute;
          left: 18px;
          top: 20px;
          width: 82px;
          height: 40px;
          background:
            radial-gradient(circle at 24px 13px, #6b3717 0 9px, transparent 10px),
            radial-gradient(circle at 55px 23px, #6b3717 0 11px, transparent 12px),
            linear-gradient(135deg, #a85f2b 0%, #8b4e22 58%, #6f3917 100%);
          border-radius: 48% 45% 42% 45%;
          box-shadow: inset -8px -8px 0 rgba(0,0,0,0.12), inset 6px 5px 0 rgba(255,255,255,0.08);
        }

        .cow-body::before {
          content: '';
          position: absolute;
          left: 26px;
          bottom: -9px;
          width: 18px;
          height: 14px;
          background: #d8c9a7;
          border-radius: 0 0 50% 50%;
        }

        .cow-head {
          position: absolute;
          left: 84px;
          top: 8px;
          width: 34px;
          height: 30px;
          background: linear-gradient(135deg, #b96b33, #8b4e22);
          border-radius: 45% 48% 52% 42%;
          transform: rotate(14deg);
          animation: cowHead 2.4s ease-in-out infinite;
          transform-origin: left center;
          box-shadow: inset -5px -5px 0 rgba(0,0,0,0.1);
        }

        .cow-head::before {
          content: '';
          position: absolute;
          right: -5px;
          top: 13px;
          width: 12px;
          height: 8px;
          background: #d7b486;
          border-radius: 50%;
        }

        .cow-head::after {
          content: '';
          position: absolute;
          right: 6px;
          top: 8px;
          width: 4px;
          height: 4px;
          background: #21130b;
          border-radius: 50%;
        }

        .cow-ear {
          position: absolute;
          right: 7px;
          top: -7px;
          width: 13px;
          height: 10px;
          background: #7a3f19;
          border-radius: 70% 30% 70% 30%;
          transform: rotate(18deg);
        }

        .cow-leg {
          position: absolute;
          bottom: 0;
          width: 8px;
          height: 29px;
          background: linear-gradient(180deg, #7a3f19, #4e260f);
          border-radius: 999px;
          transform-origin: top center;
          animation: cowLegMove 1.8s ease-in-out infinite;
        }

        .cow-leg-1 { left: 30px; animation-delay: 0s; }
        .cow-leg-2 { left: 52px; animation-delay: 0.35s; }
        .cow-leg-3 { left: 78px; animation-delay: 0.7s; }
        .cow-tail {
          position: absolute;
          left: 5px;
          top: 25px;
          width: 34px;
          height: 16px;
          border-top: 4px solid #5c2e13;
          border-radius: 50%;
          transform: rotate(-35deg);
          animation: tailSwing 1.25s ease-in-out infinite;
          transform-origin: right center;
        }

        .cow-tail::after {
          content: '';
          position: absolute;
          left: -3px;
          top: 5px;
          width: 9px;
          height: 9px;
          background: #2f1b0d;
          border-radius: 50%;
        }

        .milk-person {
          position: absolute;
          right: 24%;
          bottom: 15%;
          width: 54px;
          height: 70px;
          animation: milkMove 2.2s ease-in-out infinite;
        }

        .milk-person-head {
          position: absolute;
          left: 18px;
          top: 0;
          width: 16px;
          height: 16px;
          background: #7d4b27;
          border-radius: 50%;
        }

        .milk-person-body {
          position: absolute;
          left: 17px;
          top: 17px;
          width: 22px;
          height: 34px;
          background: #f3f0df;
          border-radius: 10px 10px 4px 4px;
          transform: rotate(18deg);
        }

        .milk-pot {
          position: absolute;
          left: 2px;
          bottom: 0;
          width: 30px;
          height: 22px;
          background: #e8e0c5;
          border-radius: 0 0 12px 12px;
          border: 3px solid #b9ac8b;
        }

        @keyframes cloudMove {
          from { transform: translateX(-160px); }
          to { transform: translateX(calc(100vw + 220px)); }
        }

        @keyframes farmerWalk {
          from { transform: translateX(-8px); }
          to { transform: translateX(22px); }
        }

        @keyframes legMoveOne {
          0%, 100% { transform: rotate(12deg); }
          50% { transform: rotate(-16deg); }
        }

        @keyframes legMoveTwo {
          0%, 100% { transform: rotate(-14deg); }
          50% { transform: rotate(14deg); }
        }

        @keyframes cowGraze {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }

        @keyframes cowHead {
          0%, 100% { transform: rotate(14deg) translateY(0); }
          50% { transform: rotate(24deg) translateY(9px); }
        }

        @keyframes tailSwing {
          0%, 100% { transform: rotate(-38deg); }
          50% { transform: rotate(-4deg); }
        }

        @keyframes cowLegMove {
          0%, 100% { transform: rotate(3deg); }
          50% { transform: rotate(-5deg); }
        }

        @keyframes farmerArm {
          0%, 100% { transform: rotate(-22deg); }
          50% { transform: rotate(10deg); }
        }

        @keyframes grassWave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }

        @keyframes milkMove {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(3px) rotate(-2deg); }
        }

        @media (max-width: 900px) {
          .premium-footer {
            padding: 56px 0;
          }

          .footer-newsletter {
            grid-template-columns: 1fr;
          }

          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }

          .farm-animation-stage {
            height: 100%;
            opacity: 0.30;
          }

          .farmer {
            left: 20%;
            transform: scale(0.86);
          }

          .cow-1 {
            right: 13%;
            transform: scale(0.86);
          }

          .cow-2 {
            right: 1%;
          }

          .milk-person {
            right: 27%;
            transform: scale(0.86);
          }

          .footer-tree {
            transform: scale(0.82);
            transform-origin: bottom center;
          }
        }

        @media (max-width: 560px) {
          .premium-footer {
            padding: 42px 0;
          }

          .footer-container {
            padding: 0 14px;
          }

          .footer-newsletter {
            border-radius: 18px;
            padding: 18px;
            margin-bottom: 30px;
          }

          .footer-headline {
            font-size: 22px;
          }

          .footer-subscribe {
            flex-direction: column;
            height: auto;
          }

          .footer-subscribe input,
          .footer-subscribe button {
            width: 100%;
            height: 46px;
            box-sizing: border-box;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }

          .farm-animation-stage {
            height: 100%;
            opacity: 0.24;
          }

          .farm-hill-back {
            height: 78px;
            bottom: 26px;
          }

          .farm-hill-front {
            height: 84px;
          }

          .footer-tree {
            width: 95px;
            height: 122px;
          }

          .footer-tree-left {
            left: -6px;
          }

          .footer-tree-right {
            right: -10px;
          }

          .tree-trunk {
            left: 42px;
            height: 66px;
            width: 12px;
          }

          .tree-leaf-1 {
            width: 62px;
            height: 48px;
            left: 6px;
            top: 26px;
          }

          .tree-leaf-2 {
            width: 62px;
            height: 50px;
            left: 36px;
            top: 38px;
          }

          .tree-leaf-3 {
            width: 52px;
            height: 42px;
            left: 24px;
            top: 16px;
          }

          .farmer {
            left: 30%;
            bottom: 20%;
            transform: scale(0.62);
            animation: none;
          }

          .cow {
            bottom: 20%;
          }

          .cow-1 {
            right: 12%;
            transform: scale(0.58);
          }

          .cow-2 {
            display: none;
          }

          .milk-person {
            right: 31%;
            bottom: 15%;
            transform: scale(0.6);
          }

          .grass-cluster {
            transform: scale(0.72);
            bottom: 15%;
          }

          .cloud {
            transform: scale(0.7);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cloud,
          .farmer,
          .farmer-leg,
          .cow,
          .cow-head,
          .cow-tail,
          .grass-cluster,
          .milk-person {
            animation: none !important;
          }
        }
      `}</style>

      <div className="footer-top-glow" />

      <div className="footer-container">
        <div className="footer-newsletter">
          <div>
            <span className="footer-kicker">THE ORGANIC WAY OF LIFE</span>
            <h2 className="footer-headline">Join the Shelke organic food movement</h2>
            <p className="footer-subtext">
              Get product updates, seasonal offers, healthy recipes and farm-fresh stories.
            </p>
          </div>

          <div className="footer-subscribe">
            <input type="email" placeholder="Enter your email" />
            <button type="button">Subscribe</button>
          </div>
        </div>

        <div className="footer-grid">
          <div>
            <h2 className="footer-brand-logo">SHELKE</h2>
            <p className="footer-brand-sub">ORGANIC FARMS</p>
            <p className="footer-text">
              Bringing pure, organic, and farm-fresh products directly from trusted farms to your home.
            </p>

            {planName && (
              <div className="footer-member-badge">
                {planName} Member Benefits Active
              </div>
            )}

            <div className="footer-social-row">
              <span className="footer-social-icon">f</span>
              <span className="footer-social-icon">◎</span>
              <span className="footer-social-icon">▶</span>
              <span className="footer-social-icon">in</span>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Shop</h4>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/shop" className="footer-link">All Products</Link>
            <Link to="/membership" className="footer-link">Membership</Link>
            <Link to="/cart" className="footer-link">Cart</Link>
          </div>

          <div>
            <h4 className="footer-title">Account</h4>
            <Link to="/account/orders" className="footer-link">My Orders</Link>
            <Link to="/account/addresses" className="footer-link">Addresses</Link>
            <Link to="/login" className="footer-link">Login</Link>
            <Link to="/contact" className="footer-link">Contact Us</Link>
          </div>

          <div>
            <h4 className="footer-title">Contact</h4>
            <p className="footer-text"><b>Email:</b><br />support@shelkeorganic.com</p>
            <p className="footer-text"><b>Phone:</b><br />+91 90000 00000</p>
            <p className="footer-text"><b>Location:</b><br />Pune, Maharashtra</p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Shelke Organic Farms. All rights reserved.</span>
          <span className="footer-bottom-links">Privacy Policy • Refund Policy • Shipping Policy</span>
        </div>
      </div>

      <div className="farm-animation-stage" aria-hidden="true">
        <div className="farm-sky-glow" />
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />

        <div className="farm-hill-back" />
        <div className="farm-hill-front" />

        <div className="footer-tree footer-tree-left">
          <div className="tree-trunk" />
          <div className="tree-leaf tree-leaf-1" />
          <div className="tree-leaf tree-leaf-2" />
          <div className="tree-leaf tree-leaf-3" />
        </div>

        <div className="footer-tree footer-tree-right">
          <div className="tree-trunk" />
          <div className="tree-leaf tree-leaf-1" />
          <div className="tree-leaf tree-leaf-2" />
          <div className="tree-leaf tree-leaf-3" />
        </div>

        <div className="grass-cluster grass-left">
          <span className="grass-blade" />
          <span className="grass-blade" />
          <span className="grass-blade" />
          <span className="grass-blade" />
          <span className="grass-blade" />
        </div>

        <div className="grass-cluster grass-right">
          <span className="grass-blade" />
          <span className="grass-blade" />
          <span className="grass-blade" />
          <span className="grass-blade" />
          <span className="grass-blade" />
        </div>

        <div className="farmer">
          <div className="farmer-basket" />
          <div className="farmer-head" />
          <div className="farmer-body" />
          <div className="farmer-leg farmer-leg-1" />
          <div className="farmer-leg farmer-leg-2" />
        </div>

        <div className="cow cow-1">
          <div className="cow-tail" />
          <div className="cow-body" />
          <div className="cow-head"><span className="cow-ear" /></div>
          <div className="cow-leg cow-leg-1" />
          <div className="cow-leg cow-leg-2" />
          <div className="cow-leg cow-leg-3" />
        </div>

        <div className="cow cow-2">
          <div className="cow-tail" />
          <div className="cow-body" />
          <div className="cow-head"><span className="cow-ear" /></div>
          <div className="cow-leg cow-leg-1" />
          <div className="cow-leg cow-leg-2" />
          <div className="cow-leg cow-leg-3" />
        </div>

        <div className="milk-person">
          <div className="milk-person-head" />
          <div className="milk-person-body" />
          <div className="milk-pot" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
