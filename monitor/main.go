package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"path"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/vrischmann/envconfig"
)

type frontendStatus int

const (
	stCdpNotConnected frontendStatus = iota
)

type unmarshalableURL struct {
	url.URL
}

func (u *unmarshalableURL) Unmarshal(s string) error {
	p, err := url.Parse(s)
	if err != nil {
		return err
	}

	u.URL = *p
	return nil
}

type config struct {
	Period  time.Duration `envconfig:"default=1m"`
	Browser struct {
		CdpUrl unmarshalableURL
		ApiUrl unmarshalableURL
	}
}

func (c *config) init() error {
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("error loading .env file: %v", err)
	}

	if err := envconfig.Init(c); err != nil {
		return fmt.Errorf("error loading configuration: %v", err)
	}

	return nil
}

func checkFrontendStatus(ctx context.Context, cnf config) (frontendStatus, error) {
	tc, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	url := cnf.Browser.CdpUrl
	url.Path = path.Join(url.Path, "json")
	req, err := http.NewRequestWithContext(tc, "GET", url.String(), nil)
	if err != nil {
		return 0, fmt.Errorf("error building request: %v", err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println("error requesting CDP:", err)
		return stCdpNotConnected, nil
	}

	b, err := io.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil {
		log.Println("error reading response:", err)
		return stCdpNotConnected, nil
	}

	var targets []struct {
		Title      string `json:"title"`
		Type       string `json:"type"`
		WsDebugUrl string `json:"webSocketDebuggerUrl"`
	}
	err = json.Unmarshal(b, &targets)
	if err != nil {
		log.Println("error unmarshaling JSON:", err)
		return stCdpNotConnected, nil
	}

	fmt.Println(targets)

	return 0, nil

}

func run(ctx context.Context, cnf *config) error {
	if err := cnf.init(); err != nil {
		return err
	}

	t := time.NewTicker(50 * time.Millisecond)
	defer t.Stop()
	var tr bool

	for {
		select {
		case <-ctx.Done():
			log.Println("run: context cancelled")
			return nil
		case <-t.C:
			if !tr {
				t.Reset(cnf.Period)
				tr = true
			}
			_, err := checkFrontendStatus(ctx, *cnf)
			if err != nil {
				return err
			}
		}
	}
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	tc := make(chan os.Signal, 1)
	signal.Notify(tc, syscall.SIGINT, syscall.SIGTERM)
	defer signal.Stop(tc)

	c := &config{}

	go func() {
		for {
			select {
			case s := <-tc:
				log.Printf("caught %q signal, stopping", s)
				signal.Stop(tc)
				cancel()
			case <-ctx.Done():
				return
			}
		}
	}()

	if err := run(ctx, c); err != nil {
		log.Fatal(err)
	}
}
