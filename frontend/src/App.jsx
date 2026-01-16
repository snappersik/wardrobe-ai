import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

function App() {
  const [step, setStep] = useState("auth"); // auth | wardrobe | outfit

  // Auth
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    city: "Kazan",
  });
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  // Clothes
  const [selectedFile, setSelectedFile] = useState(null);
  const [clothingType, setClothingType] = useState("top");
  const [color, setColor] = useState("black");
  const [material, setMaterial] = useState("cotton");
  const [season, setSeason] = useState("winter");
  const [brand, setBrand] = useState("");
  const [clothesList, setClothesList] = useState([]);

  // Outfit
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState("cold");
  const [temperature, setTemperature] = useState(-5);

  const [message, setMessage] = useState("");

  // ===== AUTH HANDLERS =====
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(`${API_BASE}/api/users/register`, registerData);
      setUser(res.data);
      setStep("wardrobe");
      setMessage("Регистрация успешна!");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.detail || "Ошибка регистрации");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(
        `${API_BASE}/api/users/login`,
        null,
        {
          params: {
            username: loginData.username,
            password: loginData.password,
          },
        }
      );
      setUser({
        id: res.data.user_id,
        username: res.data.username,
        email: res.data.email,
        city: res.data.city,
      });
      setStep("wardrobe");
      setMessage("Вход выполнен");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.detail || "Ошибка входа");
    }
  };

  // ===== CLOTHES HANDLERS =====
  const handleUploadClothing = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage("Сначала войди или зарегистрируйся");
      return;
    }
    if (!selectedFile) {
      setMessage("Выбери файл с одеждой");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("user_id", user.id);
      formData.append("clothing_type", clothingType);
      formData.append("color", color);
      formData.append("material", material);
      formData.append("season", season);
      if (brand) formData.append("brand", brand);

      const res = await axios.post(
        `${API_BASE}/api/clothes/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setMessage("Одежда загружена");
      setSelectedFile(null);
      // обновить список
      await loadClothes();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.detail || "Ошибка загрузки одежды");
    }
  };

  const loadClothes = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE}/api/clothes`, {
        params: { user_id: user.id },
      });
      setClothesList(res.data);
    } catch (err) {
      console.error(err);
      setClothesList([]);
    }
  };

  // ===== OUTFIT HANDLERS =====
  const handleGenerateOutfit = async () => {
    if (!user) {
      setMessage("Сначала войди или зарегистрируйся");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE}/api/outfits/generate`,
        null,
        {
          params: {
            user_id: user.id,
            weather_condition: weatherCondition,
            temperature,
          },
        }
      );
      setGeneratedOutfit(res.data);
      setMessage("Образ сгенерирован");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.detail || "Ошибка генерации образа");
    }
  };

  // ===== RENDER HELPERS =====
  const renderAuth = () => (
    <div className="card">
      <h2>Wardrobe AI – вход / регистрация</h2>

      <div className="grid">
        <form onSubmit={handleRegister} className="panel">
          <h3>Регистрация</h3>
          <input
            type="text"
            placeholder="Username"
            value={registerData.username}
            onChange={(e) =>
              setRegisterData({ ...registerData, username: e.target.value })
            }
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={registerData.email}
            onChange={(e) =>
              setRegisterData({ ...registerData, email: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({ ...registerData, password: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Город"
            value={registerData.city}
            onChange={(e) =>
              setRegisterData({ ...registerData, city: e.target.value })
            }
          />
          <button type="submit">Зарегистрироваться</button>
        </form>

        <form onSubmit={handleLogin} className="panel">
          <h3>Вход</h3>
          <input
            type="text"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) =>
              setLoginData({ ...loginData, username: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            required
          />
          <button type="submit">Войти</button>
        </form>
      </div>
    </div>
  );

  const renderWardrobe = () => (
    <div className="card">
      <h2>Мой гардероб</h2>
      <p>Пользователь: {user?.username}</p>

      <form onSubmit={handleUploadClothing} className="panel">
        <h3>Загрузить одежду</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <div className="grid-3">
          <div>
            <label>Тип</label>
            <select
              value={clothingType}
              onChange={(e) => setClothingType(e.target.value)}
            >
              <option value="top">Top</option>
              <option value="shirt">Shirt</option>
              <option value="tshirt">T-shirt</option>
              <option value="pants">Pants</option>
              <option value="skirt">Skirt</option>
              <option value="shorts">Shorts</option>
              <option value="shoes">Shoes</option>
              <option value="jacket">Jacket</option>
            </select>
          </div>

          <div>
            <label>Цвет</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div>
            <label>Материал</label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            />
          </div>
        </div>

        <div className="grid-2">
          <div>
            <label>Сезон</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value="winter">Winter</option>
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="autumn">Autumn</option>
            </select>
          </div>
          <div>
            <label>Бренд (опционально)</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
        </div>

        <button type="submit">Загрузить вещь</button>
        <button type="button" onClick={loadClothes}>
          Обновить список вещей
        </button>
      </form>

      <div className="panel">
        <h3>Список одежды</h3>
        {clothesList.length === 0 ? (
          <p>Пока нет загруженных вещей</p>
        ) : (
          <ul className="clothes-list">
            {clothesList.map((item) => (
              <li key={item.id}>
                <strong>{item.clothing_type}</strong> — {item.color},{" "}
                {item.material} ({item.season})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const renderOutfit = () => (
    <div className="card">
      <h2>Генерация образа</h2>

      <div className="panel">
        <h3>Параметры погоды</h3>
        <div className="grid-2">
          <div>
            <label>Состояние:</label>
            <select
              value={weatherCondition}
              onChange={(e) => setWeatherCondition(e.target.value)}
            >
              <option value="cold">Cold</option>
              <option value="warm">Warm</option>
              <option value="rain">Rain</option>
            </select>
          </div>
          <div>
            <label>Температура (°C):</label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
            />
          </div>
        </div>

        <button onClick={handleGenerateOutfit}>
          Сгенерировать образ
        </button>
      </div>

      <div className="panel">
        <h3>Результат</h3>
        {generatedOutfit ? (
          <div>
            <p>
              <strong>{generatedOutfit.name}</strong>
            </p>
            <p>
              Погода: {generatedOutfit.weather_condition} (
              {generatedOutfit.temperature}°C)
            </p>
            <p>ID образа: {generatedOutfit.id}</p>
          </div>
        ) : (
          <p>Образ ещё не сгенерирован</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="app">
      <header>
        <h1>Wardrobe AI</h1>
        {user && (
          <div className="user-info">
            <span>{user.username}</span>
            <button onClick={() => setStep("auth")}>Сменить пользователя</button>
          </div>
        )}
      </header>

      <nav>
        <button
          className={step === "auth" ? "active" : ""}
          onClick={() => setStep("auth")}
        >
          Авторизация
        </button>
        <button
          className={step === "wardrobe" ? "active" : ""}
          onClick={() => setStep("wardrobe")}
          disabled={!user}
        >
          Гардероб
        </button>
        <button
          className={step === "outfit" ? "active" : ""}
          onClick={() => setStep("outfit")}
          disabled={!user}
        >
          Образы
        </button>
      </nav>

      {message && <div className="message">{message}</div>}

      <main>
        {step === "auth" && renderAuth()}
        {step === "wardrobe" && renderWardrobe()}
        {step === "outfit" && renderOutfit()}
      </main>
    </div>
  );
}

export default App;
