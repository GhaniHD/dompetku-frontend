import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #eef2ff, #f8fafc)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: 40,
          borderRadius: 20,
          background: '#fff',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          maxWidth: 420,
          width: '90%',
        }}
      >
        {/* ICON */}
        <div
          style={{
            fontSize: 60,
            marginBottom: 10,
          }}
        >
          🚫
        </div>

        {/* TITLE */}
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 8,
            color: '#111827',
          }}
        >
          404
        </h1>

        {/* SUBTITLE */}
        <p
          style={{
            fontSize: 16,
            color: '#6B7280',
            marginBottom: 20,
          }}
        >
          Halaman yang kamu cari tidak ditemukan
        </p>

        {/* BUTTON */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 20px',
            borderRadius: 12,
            border: 'none',
            background: '#6366F1',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 14px rgba(99,102,241,.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = '#4F46E5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = '#6366F1';
          }}
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;